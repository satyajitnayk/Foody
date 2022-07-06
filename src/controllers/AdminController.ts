import { Request, Response, NextFunction } from 'express';
import { CreateVendorInput } from '../dto';
import { DeliveryUser, Transaction, Vendor } from '../models';
import { GeneratePasswordHash, GenerateSalt } from '../utility';

// Generic findVendor function
export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email: email });
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    pincode,
    foodType,
    email,
    password,
    ownerName,
    phone,
  } = <CreateVendorInput>req.body;

  const existingVendor = await FindVendor('', email);

  if (existingVendor !== null) {
    return res.json({
      message: 'Vendor already exists',
    });
  }

  // genarate salt
  const salt = await GenerateSalt();
  const passwordHash = await GeneratePasswordHash(password, salt);
  // encrypt password using the salt

  const createdVendor = await Vendor.create({
    name: name,
    address: address,
    pincode: pincode,
    foodType: foodType,
    email: email,
    password: passwordHash,
    salt: salt,
    ownerName: ownerName,
    phone: phone,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    foods: [],
    lat: 0,
    lng: 0,
  });

  return res.json(createdVendor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();
  if (vendors !== null) {
    return res.json(vendors);
  }
  return res.json({
    message: 'No vendors found',
  });
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req.params.id;
  const vendor = await FindVendor(vendorId);
  if (vendor !== null) {
    return res.json(vendor);
  }
  return res.json({
    message: 'No vendor found',
  });
};

export const GetTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transactions = await Transaction.find();

  if (transactions) {
    return res.json(transactions);
  }
  return res.json({
    message: 'transactions not available',
  });
};

export const GetTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const txnId = req.params.id;
  const transaction = await Transaction.findById(txnId);

  if (transaction) {
    return res.json(transaction);
  }
  return res.json({
    message: 'transaction not available',
  });
};

export const VerifyDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id, status } = req.body;
  const profile = await DeliveryUser.findById(_id);
  if (profile) {
    profile.verified = status;
    await profile.save();
    return res.status(200).json(profile);
  }
  return res.status(400).json({
    message: 'User not found',
  });
};

export const GetDeliveryUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUsers = await DeliveryUser.find();
  if (deliveryUsers) {
    return res.json(deliveryUsers);
  }
  return res.status(400).json({
    message: 'No delivery users found',
  });
};
