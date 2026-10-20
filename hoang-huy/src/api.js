// UI always talks to Node.js; database credentials stay on the server.
const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function request(path, { token, body, method = 'GET' } = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng thử lại.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || 'Máy chủ chưa sẵn sàng. Vui lòng thử lại.');
  if (data === null) throw new Error('Phản hồi từ máy chủ không hợp lệ.');
  return data;
}

export const api = {
  products: () => request('/products'),
  createOrder: body => request('/orders', { method: 'POST', body }),
  adminProducts: token => request('/admin/products', { token }),
  adminOrders: token => request('/admin/orders', { token }),
  updateProduct: (token, id, body) => request(`/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', token, body }),
  updateOrder: (token, id, body) => request(`/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', token, body }),
};
