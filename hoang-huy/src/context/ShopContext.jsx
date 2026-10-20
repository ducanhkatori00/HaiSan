import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {api} from '../api.js';
const ShopContext=createContext(null);
export const useShop=()=>useContext(ShopContext);
export function ShopProvider({children}){
const [products,setProducts]=useState([]),[load,setLoad]=useState('loading'),[toast,setToast]=useState(''),[receipt,setReceipt]=useState(null);
 const [cart,setCart]=useState(()=>{try{const c=JSON.parse(localStorage.getItem('hh-cart'));return c&&typeof c==='object'&&!Array.isArray(c)?Object.fromEntries(Object.entries(c).filter(([k,v])=>typeof k==='string'&&Number.isInteger(v)&&v>0&&v<=50)):{};}catch{return {};} });
 async function fetchProducts(){setLoad('loading');try{setProducts(await api.products());setLoad('done');}catch{setLoad('error');}}
useEffect(()=>{fetchProducts();},[]);
 useEffect(()=>{try{localStorage.setItem('hh-cart',JSON.stringify(cart));}catch{}},[cart]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2500);return ()=>clearTimeout(t);},[toast]);
 const lines=useMemo(()=>products.filter(p=>cart[p.id]).map(p=>({...p,quantity:cart[p.id]})),[products,cart]);const count=lines.reduce((s,p)=>s+p.quantity,0),total=lines.reduce((s,p)=>s+p.price*p.quantity,0);
 function change(id,amount){setCart(c=>{const next={...c};next[id]=Math.min(50,(next[id]||0)+amount);if(next[id]<=0)delete next[id];return next;});setReceipt(null);}
 function add(p){change(p.id,1);setToast(`Đã thêm ${p.name} vào giỏ hàng`);}
return <ShopContext.Provider value={{products,load,fetchProducts,lines,count,total,change,add,receipt,setReceipt,setCart}}>{children}{toast&&<div className="toast" role="status">✓ {toast}</div>}</ShopContext.Provider>;}
