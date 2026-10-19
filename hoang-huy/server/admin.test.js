import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after } from 'node:test';
const temp = await mkdtemp(path.join(tmpdir(), 'seafood-test-'));
process.env.LEGACY_DATA_DIR = temp;
const { updateProduct, updateOrderStatus, listOrders } = await import('./admin.js');
after(() => rm(temp, { recursive: true, force: true }));

const dataDir = temp;
const ordersDir = path.join(temp, 'orders');

test('updateProduct persists a product change', async () => {
  const updated = await updateProduct('tom-su', { price: 370000, detail: 'Tôm sú cập nhật cho admin' });
  assert.equal(updated.price, 370000);
  assert.match(updated.detail, /admin/i);

  const saved = JSON.parse(await readFile(path.join(temp, 'products.json'), 'utf8'));
  assert.equal(saved.find((p) => p.id === 'tom-su').price, 370000);
});

test('updateOrderStatus stores status and admin note', async () => {
  await mkdir(ordersDir, { recursive: true });
  const id = 'admin-status-test';
  const payload = {
    id,
    name: 'Nguyễn A',
    phone: '0912345678',
    address: '123 đường A',
    note: 'Giao buổi chiều',
    items: [{ id: 'tom-su', quantity: 2, price: 370000 }],
    total: 740000,
    status: 'Chờ xác nhận',
    createdAt: new Date().toISOString(),
  };
  await writeFile(`${ordersDir}/${id}.json`, JSON.stringify(payload, null, 2));

  const result = await updateOrderStatus(id, 'Đang giao', 'Cần gọi trước khi giao');
  assert.equal(result.status, 'Đang giao');
  assert.equal(result.adminNote, 'Cần gọi trước khi giao');

  const orders = await listOrders();
  const saved = orders.find((order) => order.id === id);
  assert.equal(saved.status, 'Đang giao');

  await rm(`${ordersDir}/${id}.json`, { force: true });
});
