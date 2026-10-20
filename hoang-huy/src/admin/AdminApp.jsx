import React from 'react';
import {Link,useRouter} from '../router.jsx';
import {AdminProvider,useAdmin} from './context/AdminContext.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import './style.css';
function AdminRoutes() {
  const {path}=useRouter();
  const {authenticated}=useAdmin();
  const Page={'/admin':DashboardPage,'/admin/products':ProductsPage,'/admin/orders':OrdersPage}[path];
  return <AdminLayout>{!Page?<section><h1>Không tìm thấy trang quản trị</h1><Link href="/admin">Về tổng quan</Link></section>:authenticated?<Page/>:<LoginPage/>}</AdminLayout>;
}
export default function AdminApp(){return <AdminProvider><AdminRoutes/></AdminProvider>;}
