import {request} from '../../api/client.js';
export const adminOrdersApi={
 list: token=>request('/admin/orders',{token}),
 update: (token,id,body)=>request(`/admin/orders/${encodeURIComponent(id)}`,{method:'PATCH',token,body}),
};
