import Dexie, { type Table } from 'dexie';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface LocalTicket {
  localId: string;
  serverId?: string;
  status: 'open' | 'paid';
  totalCents: number;
  createdAt: string;
  businessDate: string;
}

export interface LocalLine {
  id: string;
  localTicketId: string;
  menuItemId: string;
  qty: number;
}

export interface Outbox {
  id: string;
  kind: 'CreateTicket' | 'AddLine' | 'PayCash' | 'PayMock';
  key: string;
  payload: unknown;
  localTicketId: string;
  partId?: string;
  ts: string;
  tries: number;
  lastError?: string;
}

export interface Mapping {
  localTicketId: string;
  serverTicketId?: string;
}

export interface DeviceSettings {
  id: string;
  deviceId?: string;
  businessDate?: string;
}

export class PosDB extends Dexie {
  menu_cache!: Table<MenuItem, string>;
  local_tickets!: Table<LocalTicket, string>;
  local_lines!: Table<LocalLine, string>;
  outbox!: Table<Outbox, string>;
  mapping!: Table<Mapping, string>;
  device_settings!: Table<DeviceSettings, string>;

  constructor() {
    super('posdb');
    this.version(1).stores({
      menu_cache: 'id',
      local_tickets: 'localId, businessDate, status',
      local_lines: 'id, localTicketId, menuItemId',
      outbox: 'id, kind, key, localTicketId, partId, ts',
      mapping: 'localTicketId',
      device_settings: 'id',
    });
  }
}

export const db = new PosDB();
