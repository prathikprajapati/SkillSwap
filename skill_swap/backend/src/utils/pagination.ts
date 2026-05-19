/**
 * Pagination utility for consistent pagination across all endpoints
 */

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Parse and validate pagination query parameters
 * @param query - Express query object
 * @returns PaginationParams with page, limit, and skip values
 */
export function getPagination(query: {
  page?: string | undefined;
  limit?: string | undefined;
}): PaginationParams {
  const page = Math.max(parseInt(query.page as string) || 1, 1);
  const limit = Math.min(parseInt(query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Format paginated response with metadata
 * @param data - Array of data to return
 * @param total - Total count of items
 * @param query - Original query object for pagination params
 * @returns PaginatedResponse
 */
export function paginate<T>(
  data: T[],
  total: number,
  query: { page?: string | undefined; limit?: string | undefined },
): PaginatedResponse<T> {
  const { page, limit } = getPagination(query);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Default ordering by created_at descending
 * Use this for consistent ordering across all paginated queries
 */
export const defaultOrderBy = {
  created_at: "desc" as const,
};
