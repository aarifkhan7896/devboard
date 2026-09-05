import { PaginationDto } from './pagination.dto';
import { PaginatedResponse } from './pagination.interface';

export function createPagination<T>(
  paginationDto: PaginationDto,
  total: number,
  data: T[],
): PaginatedResponse<T> {
  const { page, limit } = paginationDto;
  const totalPages = Math.ceil(total / limit);

  return {
    entities: data,
    metadata: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
