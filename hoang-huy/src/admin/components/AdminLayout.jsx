import React from 'react';
import {Link,useRouter} from '../../router.jsx';
import {useAdmin} from '../context/AdminContext.jsx';
const links=[['/admin','Tổng quan'],['/admin/products','Sản phẩm'],['/admin/orders','Đơn hàng']];
export default function AdminLayout({children}) {
  const {path}=useRouter();
  const {authenticated,logout,adminBusy,adminMessage,fetchAdminData}=useAdmin();
  return <main className="admin-workspace"><aside className="admin-sidebar"><Link href="/admin" className="brand">HOÀNG HUY<small>QUẢN TRỊ</small></Link>
    <nav aria-label="Quản trị">{links.map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined} className={path===href?'active':''}>{label}</Link>)}</nav>
    <Link href="/hai-san">← Về cửa hàng</Link>
    {authenticated&&<button className="secondary" onClick={logout} disabled={adminBusy}>Đăng xuất</button>}
  </aside><div className="admin-content"><div className="admin-header"><p className="eyebrow">BẢNG ĐIỀU KHIỂN</p>{authenticated&&<button className="secondary" disabled={adminBusy} onClick={fetchAdminData}>Tải lại dữ liệu</button>}</div>
    {adminMessage&&<div className="admin-alert" role="status">{adminMessage}</div>}
    {adminBusy&&<p role="status">Đang xử lý…</p>}{children}
  </div></main>;
}
