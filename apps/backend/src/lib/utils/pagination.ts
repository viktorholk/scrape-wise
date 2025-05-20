export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export function getPaginationParams(query: any): PaginationParams {
  const page = query.page ? parseInt(query.page as string) : 1;
  const limit = query.limit ? parseInt(query.limit as string) : 10;

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit))
  };
}

export async function paginateResults<T>(
  findMany: (skip: number, take: number) => Promise<T[]>,
  count: () => Promise<number>,
  params: PaginationParams
): Promise<PaginationResult<T>> {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    findMany(skip, limit),
    count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
} 