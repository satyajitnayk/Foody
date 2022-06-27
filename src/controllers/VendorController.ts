import { Request, Response, NextFunction } from 'express';
import { CreateFoodInput, EditVendorInput, VendorLoginInput } from '../dto';
import { Food } from '../models';
import { GenerateSignature, ValidatePassword } from '../utility';
import { FindVendor } from './AdminController';

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VendorLoginInput>req.body;

  const existingVendor = await FindVendor('', email);

  if (existingVendor !== null) {
    // Validate & give access
    const validataion = await ValidatePassword(
      password,
      existingVendor.password,
      existingVendor.salt
    );

    if (validataion) {
      const signature = GenerateSignature({
        _id: existingVendor._id,
        emial: existingVendor.email,
        name: existingVendor.name,
        foodType: existingVendor.foodType,
      });
      return res.json(signature);
    } else {
      return res.json({
        message: 'Invalid password',
      });
    }
  }
};

export const GetVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  if (user) {
    const existingVendor = await FindVendor(user._id);
    return res.json(existingVendor);
  } else {
    return res.json({
      message: 'vendor info not found',
    });
  }
};

export const UpdateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { address, name, foodType, phone } = <EditVendorInput>req.body;
  const { user } = req;
  if (user) {
    const existingVendor = await FindVendor(user._id);
    if (existingVendor !== null) {
      existingVendor.foodType = foodType;
      existingVendor.address = address;
      existingVendor.name = name;
      existingVendor.phone = phone;

      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }
    return res.json(existingVendor);
  } else {
    return res.json({
      message: 'vendor info not found',
    });
  }
};

export const UpdateVendorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  if (user) {
    const vendor = await FindVendor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];

      // Get all file names
      const images = files.map((file: Express.Multer.File) => file.filename);

      vendor.coverImages.push(...images);
      const savedResult = await vendor.save();

      return res.json(savedResult);
    }
  }
  return res.json({
    message: 'something went wrong with add food',
  });
};

export const UpdateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  if (user) {
    const existingVendor = await FindVendor(user._id);
    if (existingVendor !== null) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }
    return res.json(existingVendor);
  } else {
    return res.json({
      message: 'vendor info not found',
    });
  }
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  if (user) {
    const { category, description, foodType, name, price, readyTime } = <
      CreateFoodInput
    >req.body;

    const vendor = await FindVendor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];

      // Get all file names
      const images = files.map((file: Express.Multer.File) => file.filename);

      const createdFood = await Food.create({
        vendorId: vendor._id,
        category: category,
        description: description,
        foodType: foodType,
        name: name,
        price: price,
        readyTime: readyTime,
        images: images,
      });

      vendor.foods.push(createdFood._id);
      const savedResult = await vendor.save();

      return res.json(savedResult);
    }
  }
  return res.json({
    message: 'something went wrong with add food',
  });
};

export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  if (user) {
    const foods = await Food.find({ vendorId: user._id });
    if (foods !== null) {
      return res.json(foods);
    }
  }
  return res.json({
    message: 'Foods information not found',
  });
};
