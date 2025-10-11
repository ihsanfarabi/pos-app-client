import { http } from '@/lib/fetcher';
import type {
  MenuItemResponse,
  MenuReadPort,
  PaginatedResult,
} from '@/services/api/ports';

function buildQuery({
  term,
  pageIndex,
  pageSize,
}: {
  term?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();

  if (term && term.trim().length > 0) {
    params.set('q', term.trim());
  }

  if (typeof pageIndex === 'number') {
    params.set('pageIndex', pageIndex.toString());
  }

  if (typeof pageSize === 'number') {
    params.set('pageSize', pageSize.toString());
  }

  const search = params.toString();
  return search.length > 0 ? `?${search}` : '';
}

export const menuRest: MenuReadPort = {
  async listMenuItems(query = {}) {
    const response = await http(`/api/menu${buildQuery(query)}`);
    return (await response.json()) as PaginatedResult<MenuItemResponse>;
  },
};
