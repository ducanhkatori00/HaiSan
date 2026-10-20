import React from 'react';
import Icon from '../components/Icon.jsx';
import {Link} from '../router.jsx';
export default function GuidePage(){return <main className="content-page"><section id="guide" className="section guide"><p className="eyebrow">TỪ CHỌN MÓN ĐẾN ĐẶT HÀNG</p><h2>Ba bước, thật dễ dàng.</h2><div>{[['01','Chọn hải sản','Lọc theo loại hoặc tìm món bạn yêu thích.'],['02','Thêm vào giỏ','Điều chỉnh số lượng theo nhu cầu của gia đình.'],['03','Điền thông tin','Nhập thông tin giao hàng và tạo đơn thử nghiệm.']].map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section><div className="page-action"><Link className="primary" href="/hai-san">Chọn hải sản <Icon name="arrow"/></Link></div></main>;}
