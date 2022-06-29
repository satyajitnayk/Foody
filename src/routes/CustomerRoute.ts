import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import {
  CustomerSignup,
  CustomerLogin,
  CustomerVerify,
  GetCustomerProfile,
  EditCustomerProfile,
  RequestOtp,
  CreateOrder,
  GetOrders,
  GetOrderById,
} from '../controllers';
import { Authenticate } from '../middlewares';

router.post('/signup', CustomerSignup);

router.post('/login', CustomerLogin);

// authentication
router.use(Authenticate);

router.patch('/verify', CustomerVerify);

router.get('/otp', RequestOtp);

router.get('/profile', GetCustomerProfile);

router.patch('/profile', EditCustomerProfile);

// Cart
// payment

// order
router.post('/orders', CreateOrder);
router.get('/orders', GetOrders);
router.get('/orders/:id', GetOrderById);
export { router as CustomerRoute };
