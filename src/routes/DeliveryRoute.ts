import express from 'express';
const router = express.Router();

import {
  DeliveryUserSignup,
  DeliveryUserLogin,
  GetDeliveryUserProfile,
  EditDeliveryUserProfile,
  UpdateDeliveryUserStatus,
} from '../controllers';
import { Authenticate } from '../middlewares';

router.post('/signup', DeliveryUserSignup);

router.post('/login', DeliveryUserLogin);

// authentication
router.use(Authenticate);

/**Change Service status */
router.put('/changeStatus', UpdateDeliveryUserStatus);

/** Profile */
router.get('/profile', GetDeliveryUserProfile);

router.patch('/profile', EditDeliveryUserProfile);

export { router as DeliveryRoute };
