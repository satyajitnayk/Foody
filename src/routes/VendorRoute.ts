import express, { Request, Response, NextFunction } from 'express';
import {
  AddFood,
  GetCurrentOrders,
  GetFoods,
  GetOrderDetails,
  GetVendorProfile,
  ProcessOrder,
  UpdateVendorCoverImage,
  UpdateVendorProfile,
  UpdateVendorService,
  VendorLogin,
} from '../controllers';
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router();

// code for file image upload
const imageStoreage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '_' + file.originalname);
  },
});

// max 10 images can be uploaded
const images = multer({ storage: imageStoreage }).array('images', 10);

router.post('/login', VendorLogin);

router.use(Authenticate);
router.get('/profile', GetVendorProfile);
router.patch('/profile', UpdateVendorProfile);
router.patch('/coverImage', images, UpdateVendorCoverImage);
router.patch('/service', UpdateVendorService);

router.post('/food', images, AddFood);
router.get('/foods', GetFoods);

// Orders
router.get('/orders', GetCurrentOrders);
router.put('/orders/:id/process', ProcessOrder);
router.get('/orders/:id', GetOrderDetails);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: 'Hello from Vendor' });
});

export { router as VendorRoute };
