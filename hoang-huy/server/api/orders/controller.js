import {randomUUID} from 'node:crypto';
import {validateOrder} from '../../order.js';
export const createOrder = store => async (req,res) => {
  const catalog = await store.readProducts();
  let order;
  try {order=validateOrder(req.body,catalog);} catch(error) {error.status=400;throw error;}
  const record=await store.createOrder({...order,id:randomUUID(),createdAt:new Date().toISOString(),status:'Chờ xác nhận',adminNote:''});
  res.status(201).json({id:record.id,total:record.total});
};
