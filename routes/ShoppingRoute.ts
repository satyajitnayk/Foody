import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import {
  GetFoodAvailability,
  GetFoodIn30Min,
  GetFoods,
  GetTopRestaurants,
  RestaurantById,
  SearchFoods,
} from '../controllers';

// Food Availabaility
router.get('/:pincode', GetFoodAvailability);

// Top Restaurants
router.get('/top-restaurants/:pincode', GetTopRestaurants);

// Food available in 30 mins
router.get('/food-in-30-min/:pincode', GetFoodIn30Min);

// search Foods
router.get('/search/:pincode', SearchFoods);

// find restaurants by id
router.get('/restaurant/:id', RestaurantById);

export { router as ShoppingRoute };
