import {request} from '../../api/client.js';
export const adminProductsApi={
 list: token=>request('/admin/products',{token}),
 update: (token,id,body)=>request(`/admin/products/${encodeURIComponent(id)}`,{method:'PUT',token,body}),
};
