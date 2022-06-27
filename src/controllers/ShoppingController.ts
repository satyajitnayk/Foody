import { Request, Response, NextFunction } from 'express';
import { FoodDoc, Vendor } from '../models';

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

export const GetFoodIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await Vendor.find({
    pincode: pincode,
    serviceAvailable: false,
  }).populate('foods');

  if (result.length > 0) {
    let foodResult: any = [];
    result.forEach((vendor) => {
      const foods = vendor.foods as [FoodDoc];

      foods.forEach((food) => {
        if (food.readyTime <= 30) foodResult.push(food);
      });
    });
    return res.status(200).json(foodResult);
  }

  return res.status(404).json({ message: 'No food available' });
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await Vendor.find({
    pincode: pincode,
    serviceAvailable: false,
  }).populate('foods');

  if (result.length > 0) {
    let foodResult: any = [];
    result.forEach((vendor) => {
      foodResult.push(...vendor.foods);
    });
    return res.status(200).json(foodResult);
  }
};

export const RestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const result = await Vendor.findById(id).populate('foods');

  if (result) return res.status(200).json(result);

  return res.status(404).json({ message: 'No food available' });
};
