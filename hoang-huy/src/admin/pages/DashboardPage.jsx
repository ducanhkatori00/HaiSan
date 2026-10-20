import React from 'react';
import {useAdmin} from '../context/AdminContext.jsx';
import {Link} from '../../router.jsx';
import {money} from '../../lib/catalog.js';
export default function DashboardPage() {
  const {products,adminOrders} = useAdmin();
  const pending = adminOrders.filter(order=>order.status==='Chờ xác nhận').length;
  const completed = adminOrders.filter(order=>order.status==='Hoàn tất').reduce((sum,order)=>sum+order.total,0);
  return <section><h2>Tổng quan cửa hàng</h2><div className="admin-stats">
    <Link className="panel" href="/admin/products"><span>Sản phẩm</span><strong>{products.length}</strong></Link>
    <Link className="panel" href="/admin/orders"><span>Đơn hàng</span><strong>{adminOrders.length}</strong></Link>
    <div className="panel"><span>Chờ xác nhận</span><strong>{pending}</strong></div>
    <div className="panel"><span>Giá trị đơn hoàn tất</span><strong>{money(completed)}</strong></div>
  </div></section>;
}
