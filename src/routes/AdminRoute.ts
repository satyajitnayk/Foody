import express, { Request, Response, NextFunction } from 'express';
import { CreateVendor, GetVendorById, GetVendors } from '../controllers';

const router = express.Router();

router.post('/vendor', CreateVendor);
router.get('/vendors', GetVendors);
router.get('/vendors/:id', GetVendorById);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: 'Hello from Adimn' });
});

export { router as AdminRoute };
