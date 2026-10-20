import React,{createContext,useContext,useState} from 'react';
import {adminProductsApi} from '../api/products.js';
import {adminOrdersApi} from '../api/orders.js';
import {useShop} from '../../context/ShopContext.jsx';
const AdminContext=createContext(null);
export const useAdmin=()=>useContext(AdminContext);
export function AdminProvider({children}){
const {fetchProducts}=useShop();
const [authenticated,setAuthenticated]=useState(false);
const [products,setProducts]=useState([]),[adminToken,setAdminToken]=useState(''),[adminOrders,setAdminOrders]=useState([]),[adminDrafts,setAdminDrafts]=useState({}),[adminMessage,setAdminMessage]=useState(''),[adminBusy,setAdminBusy]=useState(false);
 async function fetchAdminData(){setAdminBusy(true);setAdminMessage('');try{const [productData,orderData]=await Promise.all([adminProductsApi.list(adminToken),adminOrdersApi.list(adminToken)]);setAuthenticated(true);setProducts(productData);setAdminOrders(orderData);const drafts={};productData.forEach(p=>{drafts[p.id]={...p};});setAdminDrafts(drafts);}catch(e){setAuthenticated(false);setProducts([]);setAdminOrders([]);setAdminDrafts({});setAdminMessage(e.message||'Không thể tải dữ liệu quản trị.');}finally{setAdminBusy(false);}}
 async function saveProduct(productId){const draft=adminDrafts[productId] ?? products.find(p=>p.id===productId) ?? {};setAdminBusy(true);try{const result=await adminProductsApi.update(adminToken,productId,{name:draft.name,price:Number(draft.price),category:draft.category,unit:draft.unit,detail:draft.detail,tag:draft.tag,image:draft.image});setProducts(prev=>prev.map(item=>item.id===productId?result:item));setAdminDrafts(prev=>({...prev,[productId]:result}));setAdminMessage(`Đã lưu ${result.name}.`);fetchProducts();}catch(e){setAdminMessage(e.message||'Không thể cập nhật sản phẩm.');}finally{setAdminBusy(false);}}
 async function updateOrderStatus(orderId,status,adminNote){setAdminBusy(true);try{const result=await adminOrdersApi.update(adminToken,orderId,{status,adminNote});setAdminOrders(prev=>prev.map(order=>order.id===orderId?{...order,...result}:order));setAdminMessage(`Đã cập nhật đơn ${orderId.slice(0,8).toUpperCase()}.`);}catch(e){setAdminMessage(e.message||'Không thể cập nhật đơn hàng.');}finally{setAdminBusy(false);}}
 function handleDraftChange(productId,field,value){setAdminDrafts(prev=>({...prev,[productId]:{...(prev[productId]||{}),[field]:value}}));}

function logout(){setAdminToken('');setAuthenticated(false);setProducts([]);setAdminOrders([]);setAdminDrafts({});setAdminMessage('Đã đăng xuất.');}
return <AdminContext.Provider value={{products,adminToken,setAdminToken,adminOrders,setAdminOrders,adminDrafts,adminMessage,adminBusy,authenticated,fetchAdminData,saveProduct,updateOrderStatus,handleDraftChange,logout}}>{children}</AdminContext.Provider>;}
