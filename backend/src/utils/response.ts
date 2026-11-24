import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationMeta
): void {
  const response: ApiResponse<T> = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Record<string, string[]>
): void {
  const response: ApiResponse = { success: false, message };
  if (errors) response.errors = errors;
  res.status(statusCode).json(response);
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
