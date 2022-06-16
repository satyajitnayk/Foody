import { Request, Response, NextFunction } from 'express';
import { CreateVendorInput } from '../dto';
import { Vendor } from '../models';
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
