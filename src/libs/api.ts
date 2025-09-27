import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch<T>(
  path: string,
  options: { method?: HttpMethod; body?: any; token?: string } = {}
): Promise<T> {
  const token = options.token ?? (await AsyncStorage.getItem("access_token"));
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
  }
  return (await res.json()) as T;
}
