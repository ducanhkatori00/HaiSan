// Supabase Data API; credentials stay exclusively on the Node.js server.
export function createDatabase({ url, key, fetchImpl = fetch }) {
  if (!url || !key) throw new Error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.');
  const base = new URL(url);
  if (base.protocol !== 'https:' && base.hostname !== '127.0.0.1' && base.hostname !== 'localhost') throw new Error('SUPABASE_URL phải dùng HTTPS.');
  return async function database(table, { query = '', method = 'GET', body } = {}) {
    const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=representation' };
    if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
    const response = await fetchImpl(`${base.origin}/rest/v1/${table}?${query}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const error = new Error('Không thể truy cập cơ sở dữ liệu. Vui lòng thử lại.');
      error.status = 503;
      throw error;
    }
    return response.status === 204 ? null : response.json();
  };
}
