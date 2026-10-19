import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { products } from './products.js';

const dataDir = process.env.LEGACY_DATA_DIR || fileURLToPath(new URL('../data', import.meta.url));
const productsFile = path.join(dataDir, 'products.json');
const ordersDir = path.join(dataDir, 'orders');
const allowedStatuses = ['Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn tất', 'Hủy'];

async function ensureCatalog() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(productsFile, 'utf8');
  } catch {
    await writeFile(productsFile, JSON.stringify(products, null, 2));
  }
}

export async function readProducts() {
  await ensureCatalog();
  try {
    const raw = await readFile(productsFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      products.splice(0, products.length, ...parsed.map((item) => ({ ...item })));
      return parsed.map((item) => ({ ...item }));
    }
  } catch {
    // Ignore corrupted catalog and fall back to defaults.
  }

  const catalog = products.map((item) => ({ ...item }));
  await writeFile(productsFile, JSON.stringify(catalog, null, 2));
  return catalog;
}

export async function updateProduct(id, changes = {}) {
  const catalog = await readProducts();
  const index = catalog.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Sản phẩm không tồn tại.');

  const base = catalog[index];
  const next = {
    ...base,
    ...changes,
    id: base.id,
    name: typeof changes.name === 'string' ? changes.name.trim() : base.name,
    category: typeof changes.category === 'string' ? changes.category.trim() : base.category,
    unit: typeof changes.unit === 'string' ? changes.unit.trim() : base.unit,
    detail: typeof changes.detail === 'string' ? changes.detail.trim() : base.detail,
    tag: typeof changes.tag === 'string' ? changes.tag.trim() : base.tag,
    image: typeof changes.image === 'string' ? changes.image.trim() : base.image,
    price: Number(changes.price ?? base.price),
  };

  if (!Number.isFinite(next.price) || next.price < 0) throw new Error('Giá sản phẩm không hợp lệ.');
  if (!next.name || !next.category || !next.unit) throw new Error('Tên, danh mục và đơn vị không được để trống.');

  catalog[index] = next;
  products.splice(0, products.length, ...catalog.map((item) => ({ ...item })));
  await writeFile(productsFile, JSON.stringify(catalog, null, 2));
  return { ...next };
}

export async function listOrders() {
  await mkdir(ordersDir, { recursive: true });
  const entries = await readdir(ordersDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort()
    .reverse();

  const orders = [];
  for (const file of files) {
    try {
      const raw = await readFile(path.join(ordersDir, file), 'utf8');
      const order = JSON.parse(raw);
      if (order && order.id) {
        orders.push({
          ...order,
          status: allowedStatuses.includes(order.status) ? order.status : 'Chờ xác nhận',
          adminNote: typeof order.adminNote === 'string' ? order.adminNote : '',
        });
      }
    } catch {
      // Ignore unreadable files.
    }
  }

  return orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function updateOrderStatus(id, status, adminNote = '') {
  const filePath = path.join(ordersDir, `${id}.json`);
  let order;
  try {
    order = JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    throw new Error('Không tìm thấy đơn hàng.');
  }

  const nextStatus = allowedStatuses.includes(status) ? status : 'Chờ xác nhận';
  const next = {
    ...order,
    status: nextStatus,
    adminNote: typeof adminNote === 'string' ? adminNote.trim().slice(0, 1000) : '',
    updatedAt: new Date().toISOString(),
  };

  await mkdir(ordersDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(next, null, 2));
  return next;
}
