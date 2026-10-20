import React, {useEffect} from 'react';
import {Router, Link, useRouter} from './router.jsx';
import {ShopProvider} from './context/ShopContext.jsx';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import GuidePage from './pages/GuidePage.jsx';
import AdminApp from './admin/AdminApp.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
const pages = {
  '/': [HomePage, 'Trang chủ'],
  '/hai-san': [ProductsPage, 'Hải sản'],
  '/gioi-thieu': [AboutPage, 'Giới thiệu'],
  '/huong-dan': [GuidePage, 'Hướng dẫn đặt hàng'],
  '/gio-hang': [CartPage, 'Giỏ hàng'],
  '/thanh-toan': [CheckoutPage, 'Thông tin giao hàng'],
};
function Routes() {
  const {path} = useRouter();
  const isAdmin=path==='/admin'||path.startsWith('/admin/');
  const [Page, title] = pages[path] || [null, isAdmin?'Quản trị':'Không tìm thấy trang'];
  useEffect(() => { document.title = `${title} | Hải sản Hoàng Huy`; }, [title]);
  if(isAdmin)return <AdminApp/>;
  return <Layout>{Page ? <Page key={path} checkout={path === '/thanh-toan'}/> : <main className="not-found"><h1>Không tìm thấy trang</h1><Link className="primary" href="/">Về trang chủ</Link></main>}</Layout>;
}
export default function App() {
  return <Router><ShopProvider><Routes/></ShopProvider></Router>;
}
