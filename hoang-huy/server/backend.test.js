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

test('modular API routes preserve product, order, health and admin contracts', async t => {
  const product = {id:'tom-su',name:'Tôm sú',price:320000};
  const store = {
    readProducts: async () => [product],
    listOrders: async () => [],
    updateProduct: async (id,changes) => ({...product,id,...changes}),
    updateOrderStatus: async (id,status,adminNote) => ({id,status,adminNote}),
  };
  const server=createApp({store,adminToken:'test-admin'}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}/api`;
  assert.equal((await (await fetch(`${base}/health`)).json()).status,'ok');
  assert.deepEqual(await (await fetch(`${base}/products`)).json(),[product]);
  const headers={Authorization:'Bearer test-admin','Content-Type':'application/json'};
  for(const path of ['/admin/products','/admin/orders']) {
    assert.equal((await fetch(base+path)).status,401);
    assert.equal((await fetch(base+path,{headers})).status,200);
  }
  const updated=await fetch(`${base}/admin/products/tom-su`,{method:'PUT',headers,body:JSON.stringify({price:350000})});
  assert.equal(updated.status,200);
  assert.equal((await updated.json()).price,350000);
  const order=await fetch(`${base}/admin/orders/order-1`,{method:'PATCH',headers,body:JSON.stringify({status:'Đang giao',adminNote:'Gọi trước'})});
  assert.deepEqual(await order.json(),{id:'order-1',status:'Đang giao',adminNote:'Gọi trước'});
  const missing=await fetch(`${base}/unknown`);
  assert.equal(missing.status,404);
  assert.equal((await missing.json()).error,'Không tìm thấy API.');
});

test('backend only serves API and does not serve React pages or assets', async t => {
  const server=createApp({store:{readProducts:async()=>[]},adminToken:'test-admin'}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  for(const path of ['/','/hai-san','/admin','/index.html','/assets/missing.js']) {
    const response=await fetch(base+path);
    assert.equal(response.status,404);
    assert.match(response.headers.get('content-type'),/application\/json/);
    assert.equal((await response.json()).error,'Máy chủ này chỉ cung cấp API tại /api.');
  }
  assert.equal((await fetch(`${base}/api/products`)).status,200);
});
