import {request} from '../client.js';
export const productsApi = {list: () => request('/products')};
