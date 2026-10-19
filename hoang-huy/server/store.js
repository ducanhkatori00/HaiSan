export const allowedStatuses = ['Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn tất', 'Hủy'];
function invalid(message, status = 400) { throw Object.assign(new Error(message), { status }); }
export function createStore(database) {
  const filter = id => `id=eq.${encodeURIComponent(id)}&select=*`;
  return {
    readProducts: () => database('products', { query: 'select=*&order=id.asc' }),
    listOrders: () => database('orders', { query: 'select=*&order=createdAt.desc' }),
    async createOrder(order) {
      const rows = await database('orders', { method: 'POST', body: order });
      return rows[0];
    },
    async updateProduct(id, changes) {
      if (!changes || typeof changes !== 'object' || Array.isArray(changes)) invalid('Dữ liệu không hợp lệ.');
      const next = {};
      for (const field of ['name', 'category', 'unit', 'detail', 'tag', 'image']) {
        if (!(field in changes)) continue;
        if (typeof changes[field] !== 'string' || changes[field].length > 2000) invalid('Thông tin sản phẩm không hợp lệ.');
        next[field] = changes[field].trim();
        if (['name', 'category', 'unit'].includes(field) && !next[field]) invalid('Tên, danh mục và đơn vị không được để trống.');
      }
      if ('price' in changes) {
        if (!Number.isSafeInteger(changes.price) || changes.price < 0) invalid('Giá sản phẩm không hợp lệ.');
        next.price = changes.price;
      }
      if (!Object.keys(next).length) invalid('Chưa có thông tin cập nhật.');
      const rows = await database('products', { query: filter(id), method: 'PATCH', body: next });
      if (!rows.length) invalid('Sản phẩm không tồn tại.', 404);
      return rows[0];
    },
    async updateOrderStatus(id, status, adminNote = '') {
      if (!allowedStatuses.includes(status)) invalid('Trạng thái đơn hàng không hợp lệ.');
      if (typeof adminNote !== 'string' || adminNote.length > 1000) invalid('Ghi chú tối đa 1.000 ký tự.');
      const rows = await database('orders', { query: filter(id), method: 'PATCH', body: { status, adminNote: adminNote.trim(), updatedAt: new Date().toISOString() } });
      if (!rows.length) invalid('Không tìm thấy đơn hàng.', 404);
      return rows[0];
    },
  };
}
