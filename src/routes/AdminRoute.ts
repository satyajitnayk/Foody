import express, { Request, Response, NextFunction } from 'express';
import {
  GetTransactionById,
  CreateVendor,
  GetTransactions,
  GetVendorById,
  GetVendors,
  VerifyDeliveryUser,
  GetDeliveryUsers,
} from '../controllers';

const router = express.Router();

router.post('/vendor', CreateVendor);
router.get('/vendors', GetVendors);
router.get('/vendors/:id', GetVendorById);

router.get('/transactions', GetTransactions);
router.get('/transactions/:id', GetTransactionById);

router.put('/delivery/verify', VerifyDeliveryUser);
router.get('/delivery/users', GetDeliveryUsers);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: 'Hello from Adimn' });
});

export { router as AdminRoute };
