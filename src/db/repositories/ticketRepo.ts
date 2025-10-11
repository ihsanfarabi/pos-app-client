import { db, type LocalLine, type LocalTicket } from '@/db/schema';

async function createLocal(ticket: LocalTicket, lines: LocalLine[]) {
  await db.transaction('rw', db.local_tickets, db.local_lines, async () => {
    await db.local_tickets.put(ticket);
    if (lines.length > 0) {
      await db.local_lines.bulkPut(lines);
    }
  });
}

async function markPaidLocal(localTicketId: string) {
  await db.local_tickets.update(localTicketId, { status: 'paid' });
}

export const ticketsRepo = {
  createLocal,
  markPaidLocal,
};
