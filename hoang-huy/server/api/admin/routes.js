import {Router} from 'express';
import {adminAuth} from '../../middleware/admin-auth.js';
import {createRouter as productsRouter} from './products/routes.js';
import {createRouter as ordersRouter} from './orders/routes.js';
export function createRouter({store,adminToken}){
  const router=Router();
  router.use(adminAuth(adminToken));
  router.use('/products',productsRouter(store));
  router.use('/orders',ordersRouter(store));
  return router;
}
