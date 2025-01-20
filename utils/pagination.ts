export interface Paginated<T> {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: T[];
}

export const paginate = <T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
): Paginated<T> => {
  return {
    page,
    pageSize,
    total,
    hasNextPage: page < Math.ceil(total / pageSize),
    hasPreviousPage: page > 1,
    data,
  };
};

const defaultPageSize = parseInt(process.env.DEFAULT_PAGE_SIZE || "10");
const maxPageSize = parseInt(process.env.MAX_PAGE_SIZE || "50");

export const getPagination = (query: {
  pageSize?: string;
  page?: string;
}): { page: number; pageSize: number } => {
  return {
    page: parseInt(query.page) || 1,
    pageSize: Math.min(
      parseInt(query.pageSize) || defaultPageSize,
      maxPageSize,
    ),
  };
};
