import { Request, Response, NextFunction } from 'express';
import { Vendor } from '../models';

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await Vendor.find({
    pincode: pincode,
    serviceAvailable: false,
  })
    .sort({ rating: 'desc' })
    .populate('foods');

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ message: 'No food available' });
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await Vendor.find({
    pincode: pincode,
    serviceAvailable: false,
  })
    .sort({ rating: 'desc' })
    .limit(10);

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ message: 'No food available' });
};

export const GetFoodIn30Min = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
export const SearchFoods = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
export const RestaurantById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
