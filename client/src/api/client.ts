export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? "Có lỗi xảy ra");
  }
  return body as T;
}

export type RoomType = { id: number; name: string; notes: string | null };

export type Room = {
  id: number;
  hotelName: string;
  address: string;
  bedType: string | null;
  numberPeople: number | null;
  numberBed: number | null;
  quality: number | null;
  price: number;
  area: number;
  status: number | null;
  detail: string | null;
  image: string | null;
  type: { id: number; name: string } | null;
};

export type Paged<T> = { items: T[]; page: number; pageSize: number; total: number };
