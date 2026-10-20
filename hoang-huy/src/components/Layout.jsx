import React from 'react';
import Icon from './Icon.jsx';
import {Link, useRouter} from '../router.jsx';
import {useShop} from '../context/ShopContext.jsx';
const menu = [['/', 'Trang chủ'], ['/hai-san', 'Hải sản'], ['/gioi-thieu', 'Giới thiệu'], ['/huong-dan', 'Cách đặt hàng'], ['/admin', 'Admin']];
export default function Layout({children}) {
  const {path} = useRouter();
  const {count} = useShop();
  return <>
    <div className="announcement">Từ vị biển, đến bữa cơm nhà <span>✦</span> Khám phá hải sản cùng Hoàng Huy</div>
    <header>
      <Link href="/" className="brand"><span className="brand-mark"><Icon name="fish"/></span><span>HOÀNG HUY<small>HẢI SẢN & VỊ BIỂN</small></span></Link>
      <nav aria-label="Điều hướng chính">{menu.map(([href,label]) => <Link key={href} href={href} className={path === href ? 'nav-button active' : 'nav-button'} aria-current={path === href ? 'page' : undefined}>{label}</Link>)}</nav>
      <Link href="/gio-hang" className="cart-button" aria-label={`Giỏ hàng, ${count} sản phẩm`}><Icon name="bag"/><span>Giỏ hàng</span><b>{count}</b></Link>
    </header>
    {children}
    <footer className="footer"><div><Link className="brand" href="/">HOÀNG HUY</Link><p>Hải sản & vị biển cho bữa cơm nhà.</p><Link href="/huong-dan">Hướng dẫn đặt hàng <Icon name="arrow"/></Link></div></footer>
  </>;
}
