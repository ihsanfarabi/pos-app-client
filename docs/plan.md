# POS Frontend (Vite + React) – Idempotent Offline-First Architecture

## Overview

This document outlines the **frontend plan** for a POS terminal built with **Vite + React**, targeting an **offline-first**, **idempotent**, and **resilient** architecture. The backend is ready and exposes the following idempotent endpoints:

* `POST /api/tickets` — Create ticket
* `POST /api/tickets/{id}/lines` — Add ticket line
* `POST /api/tickets/{id}/pay/cash` — Pay ticket (cash)
* `POST /api/tickets/{id}/pay/mock` — Pay ticket via mock gateway

The backend enforces **idempotency** at the command handler level using the `Idempotency-Key` header.

---

## 1. Frontend Core Architecture

### Framework

* **Frontend Stack:** `Vite + React + TypeScript`
* **Offline DB:** `Dexie` (IndexedDB abstraction)
* **State/Data:** `Zustand` + `React Query`
* **UI:** `TailwindCSS + shadcn/ui`
* **Build target:** PWA-compatible (later wrap with Capacitor for Android)

### Hexagonal Pattern

Frontend is split into **Ports** (interfaces) and **Adapters** (implementations):

```
features/         # Screens and workflows
services/api/     # Ports + REST adapters
services/sync/    # Outbox & Flusher logic
entities/         # Domain models
lib/              # Common utils (fetcher, keygen, date)
db/               # Dexie schema and repositories
```

---

## 2. Idempotency Design

### Idempotency Key Format

Each command (create/add/pay) carries a deterministic key:

```
{tenantId}:{storeId}:{deviceId}:{businessDate}:{command}:{entityId}:{part}:{v}
```

**Definitions:**

* `command`: one of `CreateTicket`, `AddLine`, `PayCash`, `PayMock`
* `entityId`: local ticket ID (UUIDv4/v7 generated client-side)
* `part`: lineLocalId (for AddLine) or paymentLocalId (for Pay*)
* `v`: integer version (usually starts at 1)

### Example Keys

```
A1:B1:D1:2025-10-11:CreateTicket:lt-uuid1:v1
A1:B1:D1:2025-10-11:AddLine:lt-uuid1:ll-uuid9:v1
A1:B1:D1:2025-10-11:PayCash:lt-uuid1:pm-uuid2:v1
```

These keys ensure that:

* Repeated submissions of the same command are safe.
* Retries after offline recovery reuse the same key.
* The backend deduplicates at handler-level.

---

## 3. Offline-First Flow

### 3.1 Local Dexie Tables

| Table           | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `menu_cache`    | Locally cached menu pages from `/api/menu`            |
| `local_tickets` | Locally created tickets (with client-generated UUIDs) |
| `local_lines`   | Ticket lines pending or synced                        |
| `outbox`        | Command queue with `key`, `payload`, `kind`, `tries`  |
| `mapping`       | Map `localTicketId → serverTicketId`                  |

### 3.2 Outbox Command Types

```ts
type CmdCreateTicket = { kind: 'CreateTicket'; key: string; payload: {}; localTicketId: string };
type CmdAddLine = { kind: 'AddLine'; key: string; payload: { menuItemId: string; qty: number }; localTicketId: string; lineLocalId: string };
type CmdPayCash = { kind: 'PayCash'; key: string; payload: {}; localTicketId: string; paymentLocalId: string };
type CmdPayMock = { kind: 'PayMock'; key: string; payload: { shouldSucceed: boolean }; localTicketId: string; paymentLocalId: string };
```

### 3.3 Command Replay Order

```
CreateTicket → AddLine(s) → PayCash / PayMock
```

Each command in the outbox is retried until success. If the device is offline, it continues to queue commands.

### 3.4 Flusher Algorithm

1. Get oldest outbox command.
2. Check if dependencies (e.g., mapping) exist.
3. POST with `Idempotency-Key` header.
4. On 200 → delete from outbox; update local state.
5. On 5xx/network → retry later.
6. On 409 with same key → treat as success.
7. On 400 → mark permanent fail.

### 3.5 Mapping Logic

* When a `CreateTicket` succeeds, persist mapping `{localTicketId, serverTicketId}`.
* All `AddLine`/`Pay*` commands consult this map before calling backend.

---

## 4. REST Adapters

```ts
export async function createTicket(idemKey: string) {
  const r = await http(`/api/tickets`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idemKey }
  });
  return r.json(); // { id }
}

export async function addLine(ticketId: string, dto: any, idemKey: string) {
  await http(`/api/tickets/${ticketId}/lines`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idemKey },
    body: JSON.stringify(dto)
  });
}

export async function payCash(ticketId: string, idemKey: string) {
  const r = await http(`/api/tickets/${ticketId}/pay/cash`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idemKey }
  });
  return r.json();
}

export async function payMock(ticketId: string, dto: any, idemKey: string) {
  const r = await http(`/api/tickets/${ticketId}/pay/mock`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idemKey },
    body: JSON.stringify(dto)
  });
  return r.json();
}
```

---

## 5. Auth Integration

Use `/api/auth/login` → `/api/auth/me` → `/api/auth/refresh` for session control.

* Store access token in memory (Zustand) + refresh in IndexedDB.
* Attach `Authorization: Bearer {token}` in `fetcher.ts`.
* Handle 401 → refresh once → redirect to login if still invalid.

---

## 6. UI Flow Summary

| Screen              | Role                                                |
| ------------------- | --------------------------------------------------- |
| **Login**           | Authenticate, store token                           |
| **Sell**            | Load `menu_cache`, build cart, start local ticket   |
| **Checkout (Cash)** | Enqueue CreateTicket → AddLine(s) → PayCash         |
| **Checkout (Mock)** | Enqueue CreateTicket → AddLine(s) → PayMock         |
| **Tickets (Today)** | Show local tickets (paid, pending sync)             |
| **Settings**        | Device info (tenant, store, deviceId, businessDate) |

---

## 7. Error & Retry Strategy

| Error                  | FE Action                                  |
| ---------------------- | ------------------------------------------ |
| **401 Unauthorized**   | Try refresh, else redirect to login        |
| **400 ProblemDetails** | Mark permanent fail (UI toast)             |
| **409 Key conflict**   | Accept as success (same key = same intent) |
| **5xx / Network**      | Retry with exponential backoff             |

---

## 8. Developer Notes

### Day-1 Essentials

* `makeIdemKey()` utility implemented and used everywhere.
* `enqueue()` and `flushOutbox()` handle all writes.
* `menu_cache` populated on startup.
* Local sale fully offline-capable.

### Deferred (Safe to Add Later)

* Background sync via Service Worker.
* Push-based delta sync (SignalR/WebSocket).
* Real printer/EDC integration.
* PWA install prompt and offline shell.

---

## 9. Acceptance Tests

1. **Offline sale:** turn off Wi-Fi, create + pay; see queued in outbox.
2. **Online replay:** reconnect; verify flush succeeds, ticket visible in backend.
3. **Double-tap pay:** backend returns duplicate; FE idempotent.
4. **Crash recovery:** restart app → flusher resumes; backend deduplicates.

---

## 10. Summary

✅ **Offline-first**: Dexie + outbox queue ✅ **Idempotent**: deterministic keys per command ✅ **Crash-safe**: replay pipeline reuses same keys ✅ **Future-proof**: background sync & delta-ready

This architecture ensures no double charges, no data loss, and no rewrites when adding offline sync or service worker later.
