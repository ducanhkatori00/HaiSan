import {Router} from 'express';
import {asyncHandler} from '../../middleware/async-handler.js';
import {createOrder} from './controller.js';
export function createRouter(store){
  const router=Router();
  router.post('/',asyncHandler(createOrder(store)));
  return router;
}
