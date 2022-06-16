import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Food Availabaility
router.get('/:pincode')

// Top Restaurants
router.get('/top-restaurants/:pincode')

// Food available in 30 mins
router.get('/food-in-30-min/:pincode')

// search Foods
router.get('/search/:pincode')

// find restaurants by id
router.get('restaurant/:id')

export { router as AdminRoute };
