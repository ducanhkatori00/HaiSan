import {Router} from 'express';
import {asyncHandler} from '../../middleware/async-handler.js';
import {health} from './controller.js';
export function createRouter(store){
  const router=Router();
  router.get('/',asyncHandler(health(store)));
  return router;
}
