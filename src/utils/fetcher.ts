const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const fetcher = (url: string) => {
  const fullUrl = url.startsWith('/') ? `${API_BASE}${url}` : url;
  return fetch(fullUrl).then((r) => r.json());
};
