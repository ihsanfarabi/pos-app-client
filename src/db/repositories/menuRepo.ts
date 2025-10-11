import { db, type MenuItem } from '@/db/schema';

function sortByName(items: MenuItem[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

async function list(term?: string) {
  const search = term?.trim().toLowerCase();
  const items = await db.menu_cache.toArray();

  if (!search) {
    return sortByName(items);
  }

  return sortByName(
    items.filter((item) => item.name.toLowerCase().includes(search)),
  );
}

async function get(id: string) {
  return db.menu_cache.get(id);
}

async function replaceAll(items: MenuItem[]) {
  await db.transaction('rw', db.menu_cache, async () => {
    await db.menu_cache.clear();
    if (items.length > 0) {
      await db.menu_cache.bulkPut(items);
    }
  });
}

export const menuRepo = {
  list,
  get,
  replaceAll,
};
