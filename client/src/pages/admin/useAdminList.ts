import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, type Paged } from "../../api/client";

/**
 * Tải danh sách có phân trang theo query string trên URL, để bộ lọc và trang hiện tại
 * giữ nguyên khi tải lại hoặc chia sẻ link.
 */
export function useAdminList<T>(endpoint: string) {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Paged<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const query = params.toString();

  const reload = useCallback(() => {
    setError(null);
    api<Paged<T>>(`${endpoint}?${query}`)
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [endpoint, query]);

  useEffect(reload, [reload]);

  /** Đổi bộ lọc và quay về trang 1; giá trị rỗng sẽ bị xóa khỏi URL */
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next);
  };

  const setPage = (page: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    setParams(next);
  };

  return { data, error, setError, reload, params, setFilter, setPage };
}
