import {request} from '../client.js';
export const ordersApi = {create: body => request('/orders', {method:'POST', body})};
