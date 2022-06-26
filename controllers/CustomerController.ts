import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import {
  CreateCustomerInputs,
  CustomerLoginInputs,
  EditCustomerProfileInputs,
} from '../dto';
import { validate } from 'class-validator';
import {
  GeneratePasswordHash,
  GenerateSalt,
  GenerateOtp,
  OnRequestOTP,
  GenerateSignature,
  ValidatePassword,
} from '../utility';
import { Customer } from '../models';

export const CustomerSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInput = plainToClass(CreateCustomerInputs, req.body);
  const inputErrors = await validate(customerInput, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password } = customerInput;

  const salt = await GenerateSalt();
  const userPassswordHash = await GeneratePasswordHash(password, salt);

  const { otp, expiry } = GenerateOtp();

  const existCustomer = await Customer.findOne({ email: email });
  if (existCustomer) {
    return res.status(400).json({
      message: 'An user with the emailId already exists',
    });
  }

  const result = await Customer.create({
    email,
    phone,
    password: userPassswordHash,
    salt,
    otp,
    otpExpiry: expiry,
    verified: false,
    lat: 0,
    lng: 0,
    firstName: '',
    lastName: '',
    address: '',
  });

  if (result) {
    // send otp to user
    await OnRequestOTP(otp, phone);
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

export const CustomerLogin = async (
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
  const customer = await Customer.findOne({
    email: email,
  });
  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });
      return res.status(200).json({
        signature,
        email: customer.email,
        verified: customer.verified,
      });
    }
  }
  return res.status(400).json({ message: 'Error with login' });
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otpExpiry >= new Date()) {
        profile.verified = true;
        const updatedCustomerProfile = await profile.save();

        const signature = GenerateSignature({
          _id: updatedCustomerProfile._id,
          email: updatedCustomerProfile.email,
          verified: updatedCustomerProfile.verified,
        });
        // send signature to user
        return res.status(200).json({
          signature,
          email: updatedCustomerProfile.email,
          verified: updatedCustomerProfile.verified,
        });
      }
    }
  }

  return res.status(400).json({ message: 'Error with otp validation' });
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      const { otp, expiry } = GenerateOtp();
      profile.otp = otp;
      profile.otpExpiry = expiry;

      await profile.save();
      await OnRequestOTP(otp, profile.phone);

      return res.status(200).json({
        message: 'otp sent to registered phone number',
      });
    }
  }
  return res.status(400).json({ message: 'Error with otp request' });
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      return res.status(200).json({
        profile,
      });
    }
  }
  return res
    .status(400)
    .json({ message: 'Error with getting customer profile' });
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  if (customer) {
    const profile = await Customer.findById(customer._id);
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
