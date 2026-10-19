import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';
import { createDatabase } from './supabase.js';
import { createStore } from './store.js';

const customer = { name: 'Nguyễn An', phone: '0912345678', address: '123 Nguyễn Huệ, TP.HCM', items: [{ id: 'tom-su', quantity: 2, price: 1 }] };
test('API protects admin and saves orders at current database prices', async t => {
  const saved = [];
  const store = {
    readProducts: async () => [{ id: 'tom-su', name: 'Tôm sú', price: 400000 }],
    createOrder: async order => { saved.push(order); return order; },
    listOrders: async () => saved,
  };
  const server = createApp({ store, adminToken: 'test-admin' }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${base}/api/admin/orders`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/orders`, { headers: { Authorization: 'Bearer wrong' } })).status, 401);
  const created = await fetch(`${base}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customer) });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).total, 800000);
  assert.equal(saved[0].items[0].price, 400000);
  const orders = await fetch(`${base}/api/admin/orders`, { headers: { Authorization: 'Bearer test-admin' } });
  assert.equal((await orders.json()).length, 1);
  const invalid = await fetch(`${base}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...customer, items: [null] }) });
  assert.equal(invalid.status, 400);
  assert.equal(saved.length, 1);
});
test('database outages return JSON errors', async t => {
  const server = createApp({ store: { readProducts: async () => { throw Object.assign(new Error('Database unavailable'), { status: 503 }); } }, adminToken: 'test' }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/products`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'Database unavailable');
});
test('Supabase requests keep secret keys in server headers and hide upstream errors', async () => {
  let options;
  const db = createDatabase({ url: 'https://example.supabase.co', key: 'sb_secret_test', fetchImpl: async (url, init) => { options = { url, ...init }; return new Response('[{"id":"tom-su"}]'); } });
  const store = createStore(db);
  assert.equal((await store.readProducts())[0].id, 'tom-su');
  assert.equal(options.headers.apikey, 'sb_secret_test');
  assert.equal(options.headers.Authorization, undefined);
  await store.updateProduct('tom-su', { price: 123, id: 'overwrite', unexpected: 'ignore' });
  assert.deepEqual(JSON.parse(options.body), { price: 123 });
  await assert.rejects(() => store.updateProduct('tom-su', { price: -1 }));
  await assert.rejects(() => store.updateOrderStatus('id', 'invalid'));
  const failing = createDatabase({ url: 'https://example.supabase.co', key: 'sb_secret_test', fetchImpl: async () => new Response('private upstream message', { status: 500 }) });
  await assert.rejects(() => failing('products'), error => error.status === 503 && !error.message.includes('private'));
});
