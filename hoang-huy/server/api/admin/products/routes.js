import {Router} from 'express';
import {asyncHandler} from '../../../middleware/async-handler.js';
import {listProducts,updateProduct} from './controller.js';
export function createRouter(store){
  const router=Router();
  router.get('/',asyncHandler(listProducts(store)));
  router.put('/:id',asyncHandler(updateProduct(store)));
  return router;
}
