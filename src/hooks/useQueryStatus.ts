import { type UseQueryResult } from '@tanstack/react-query';

export function useQueryStatus<TData = unknown, TError = unknown>(
  query: UseQueryResult<TData, TError>,
) {
  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    isInitialLoading: query.isLoading && !query.data,
    hasData: !!query.data,
  };
}
