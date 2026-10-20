import {Router} from 'express';
import {asyncHandler} from '../../../middleware/async-handler.js';
import {listOrders,updateOrder} from './controller.js';
export function createRouter(store){
  const router=Router();
  router.get('/',asyncHandler(listOrders(store)));
  router.patch('/:id',asyncHandler(updateOrder(store)));
  return router;
}
