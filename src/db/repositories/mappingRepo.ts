import { db, type Mapping } from '@/db/schema';

async function get(localTicketId: string) {
  return db.mapping.get(localTicketId);
}

async function set(localTicketId: string, serverTicketId: string) {
  await db.mapping.put({ localTicketId, serverTicketId } satisfies Mapping);
}

export const mapRepo = {
  get,
  set,
};
