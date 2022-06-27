import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import {
  CustomerSignup,
  CustomerLogin,
  CustomerVerify,
  GetCustomerProfile,
  EditCustomerProfile,
  RequestOtp,
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

export { router as CustomerRoute };
