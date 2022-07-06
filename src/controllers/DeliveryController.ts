import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import {
  CreateDeliveryUserInputs,
  CustomerLoginInputs,
  EditCustomerProfileInputs,
} from '../dto';
import { validate } from 'class-validator';
import {
  GeneratePasswordHash,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from '../utility';

import { DeliveryUser } from '../models';

export const DeliveryUserSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);
  const inputErrors = await validate(deliveryUserInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password, address, firstName, lastName, pincode } =
    deliveryUserInputs;

  const salt = await GenerateSalt();
  const userPassswordHash = await GeneratePasswordHash(password, salt);

  const existingDeliveryUser = await DeliveryUser.findOne({ email: email });

  if (existingDeliveryUser) {
    return res.status(400).json({
      message: 'A delivery user with the emailId already exists',
    });
  }

  const result = await DeliveryUser.create({
    email: email,
    phone: phone,
    password: userPassswordHash,
    salt: salt,
    firstName: firstName,
    lastName: lastName,
    address: address,
    pincode: pincode,
    lat: 0,
    lng: 0,
    isAvailable: false,
  });

  if (result) {
    // generate signature
    const signature = GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });
    // send signature to user
    return res.status(200).json({
      signature,
      email: result.email,
      verified: result.verified,
    });
  }

  return res.status(400).json({ message: 'Error with signup' });
};

export const DeliveryUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(CustomerLoginInputs, req.body);
  const loginErrors = await validate(loginInputs, {
    validationError: { target: false },
  });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }
  const { email, password } = loginInputs;
  const deliveryUser = await DeliveryUser.findOne({
    email: email,
  });
  if (deliveryUser) {
    const validation = await ValidatePassword(
      password,
      deliveryUser.password,
      deliveryUser.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });
      return res.status(200).json({
        signature,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });
    }
  }
  return res.status(400).json({ message: 'Error with login' });
};

export const GetDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUser = req.user;
  if (deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);
    if (profile) {
      return res.status(200).json({
        profile,
      });
    }
  }
  return res
    .status(400)
    .json({ message: 'Error with getting deliveryUser profile' });
};

export const EditDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUser = req.user;
  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });
  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  if (deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);
    if (profile) {
      profile.firstName = profileInputs.firstName;
      profile.lastName = profileInputs.lastName;
      profile.address = profileInputs.address;
      const updatedProfile = await profile.save();
      return res.status(200).json(updatedProfile);
    }
  }
  return res.status(400).json({ message: 'Error with editing profile' });
};

export const UpdateDeliveryUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUser = req.user;
  if (deliveryUser) {
    const { lat, lng } = req.body;

    const profile = await DeliveryUser.findById(deliveryUser._id);

    if (profile) {
      if (lat && lng) {
        profile.lat = lat;
        profile.lng = lng;
      }
      profile.isAvailable = !profile.isAvailable;
      const updatedProfile = await profile.save();
      return res.status(200).json(updatedProfile);
    }
  }
  return res
    .status(400)
    .json({ message: 'Error with updating delivery user status' });
};
