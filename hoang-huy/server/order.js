import { products } from './products.js';
export function validateOrder(body, catalog = products) {
 const {name,phone,address,items,note=''}=body || {};
 if(typeof name!=='string'||name.trim().length<2||name.length>100) throw new Error('Vui lòng nhập họ tên hợp lệ.');
 if(typeof phone!=='string'||!/^0\d{9}$/.test(phone.replace(/[ .-]/g,''))) throw new Error('Vui lòng nhập số điện thoại Việt Nam gồm 10 số.');
 if(typeof address!=='string'||address.trim().length<10||address.length>500) throw new Error('Vui lòng nhập địa chỉ giao hàng đầy đủ.');
 if(typeof note!=='string'||note.length>1000) throw new Error('Ghi chú tối đa 1.000 ký tự.');
 if(!Array.isArray(items)||!items.length||items.length>30) throw new Error('Giỏ hàng không hợp lệ.');
 const seen=new Set();
 const lines=items.map(i=>{const p=catalog.find(p=>p.id===i?.id);if(!p||seen.has(i.id)||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>50)throw new Error('Sản phẩm hoặc số lượng không hợp lệ.');seen.add(i.id);return {id:p.id,name:p.name,quantity:i.quantity,price:p.price};});
 return {name:name.trim(),phone:phone.replace(/[ .-]/g,''),address:address.trim(),note:note.trim(),items:lines,total:lines.reduce((s,i)=>s+i.quantity*i.price,0)};
}
