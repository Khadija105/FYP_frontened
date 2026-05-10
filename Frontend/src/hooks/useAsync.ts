import { useState, useCallback, useEffect } from "react";
import { getErrorMessage, shouldLogout } from "../utils/errors";
import { useAuthStore } from "../store";

interface UseAsyncOptions {
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
  autoFetch?: boolean;
}

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => Promise<void>;
}

/**
 * Generic hook for handling async API calls with loading and error states
 */
export const useAsync = <T,>(
  asyncFn: () => Promise<T>,
  deps?: any[],
  options?: UseAsyncOptions
): UseAsyncState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = useAuthStore((s) => s.logout);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      setError(null);
      options?.onSuccess?.(result);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      options?.onError?.(err);

      if (shouldLogout(err)) {
        await logout();
      }
    } finally {
      setLoading(false);
    }
  }, [asyncFn, logout, options]);

  useEffect(() => {
    if (options?.autoFetch !== false) {
      execute();
    }
  }, deps ? deps : [execute, options?.autoFetch]);

  const retry = useCallback(async () => {
    await execute();
  }, [execute]);

  return { data, loading, error, retry };
};

/**
 * Hook for handling mutation (POST/PATCH/DELETE) operations
 */
export const useMutation = <TData, TPayload = void>(
  mutationFn: (payload: TPayload) => Promise<TData>,
  options?: UseAsyncOptions
) => {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = useAuthStore((s) => s.logout);

  const mutate = useCallback(
    async (payload: TPayload) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(payload);
        setData(result);
        setError(null);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        options?.onError?.(err);

        if (shouldLogout(err)) {
          await logout();
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, logout, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, mutate, reset };
};

/**
 * Hook for paginated data fetching
 */
export const usePaginatedAsync = <T,>(
  asyncFn: (page: number, pageSize: number) => Promise<T[]>,
  pageSize = 12
) => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = useAuthStore((s) => s.logout);

  const fetchPage = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(page, pageSize);
        setData(result);
        setCurrentPage(page);
      } catch (err) {
        setError(getErrorMessage(err));
        if (shouldLogout(err)) {
          await logout();
        }
      } finally {
        setLoading(false);
      }
    },
    [asyncFn, pageSize, logout]
  );

  useEffect(() => {
    fetchPage(1);
  }, []);

  return { data, currentPage, loading, error, fetchPage, pageSize };
};
