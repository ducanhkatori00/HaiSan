import React from 'react';
import {useAdmin} from '../context/AdminContext.jsx';
export default function LoginPage() {
  const {adminToken,setAdminToken,fetchAdminData,adminBusy} = useAdmin();
  return <section className="panel"><h2>Đăng nhập quản trị</h2><p>Nhập mã truy cập để quản lý sản phẩm và đơn hàng.</p><form className="admin-login" onSubmit={event => {event.preventDefault();if(!adminBusy)fetchAdminData();}}>
    <label>Mã truy cập quản trị<input type="password" autoComplete="off" value={adminToken} onChange={event=>setAdminToken(event.target.value)} required disabled={adminBusy}/></label>
    <button className="primary" disabled={adminBusy}>{adminBusy?'Đang đăng nhập…':'Đăng nhập'}</button>
  </form></section>;
}
