import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import {
  CartItem,
  CreateCustomerInputs,
  CustomerLoginInputs,
  EditCustomerProfileInputs,
  OrdersInput,
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
import {
  Customer,
  Food,
  Order,
  OrderDoc,
  Offer,
  Transaction,
  Vendor,
  DeliveryUser,
} from '../models';

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
    orders: [],
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

export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate('cart.food');
    let cartItems = Array();
    const { _id, unit } = <CartItem>req.body;

    const food = await Food.findById(_id);

    if (food) {
      if (profile != null) {
        // check for cart items
        cartItems = profile.cart;
        if (cartItems.length > 0) {
          //check and update
          let existFoodItems = cartItems.filter(
            (item) => item.food._id.toString() === _id.toString()
          );

          if (existFoodItems.length > 0) {
            const index = cartItems.indexOf(existFoodItems[0]);
            if (unit > 0) {
              cartItems[index] = { food, unit };
            } else {
              // when unit is 0, remove the item from cart
              cartItems.splice(index, 1);
            }
          } else {
            cartItems.push({ food, unit });
          }
        } else {
          // add new item
          cartItems.push({ food, unit });
        }

        if (cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.status(200).json(cartItems);
        }
      }
    }
  }
  return res.status(400).json({ message: 'Error with adding to cart' });
};

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate('cart.food');
    if (profile) {
      return res.status(200).json(profile.cart);
    }
  }
  return res.status(400).json({ message: 'cart is empty' });
};

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate('cart.food');
    if (profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();
      return res.status(200).json(cartResult);
    }
  }
  return res.status(400).json({ message: 'cart is already empty' });
};

export const CreatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const { amount, paymentMode, offerId } = req.body;
  let payableAmount = Number(amount);
  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);
    if (appliedOffer) {
      if (appliedOffer.isActive) {
        payableAmount = Number(payableAmount - appliedOffer.offerAmount);
      }
    }
  }

  // Perform payment gateway charge api call

  // create payment record
  const transaction = await Transaction.create({
    customer: customer._id,
    vendorId: '',
    orderId: '',
    orderValue: payableAmount,
    offerUsed: offerId || 'NA',
    status: 'OPEN',
    paymentMode: paymentMode,
    paymentResponse: 'Payment is cach on delivery',
  });
  // return txnID

  return res.status(200).json(transaction);
};

/** Delivery Notification */
const assignOrderForDelivery = async (orderId: string, vendorId: string) => {
  // find the vendor
  const vendor = await Vendor.findById(vendorId);
  if (vendor) {
    const pincode = vendor.pincode;
    const vendorLat = vendor.lat;
    const vendorLng = vendor.lng;

    // find the available delivery person
    const deliveryUser = await DeliveryUser.find({
      pincode: pincode,
      verified: true,
      isAvailable: true,
    });
    if (deliveryUser) {
      // assign the order to the nearest delivery person
      const currentOrder = await Order.findById(orderId);

      if (currentOrder) {
        // Update the order status to ASSIGNED & deliveryIdx
        currentOrder.deliveryId = deliveryUser[0]._id;
        await currentOrder.save();

        // Notify to vendor for received New Order using Firebase Push Notification
      }
    }
  }
};

// validate txn
export const ValidateTransaction = async (txnId: string) => {
  const currentTransaction = await Transaction.findById(txnId);
  if (currentTransaction) {
    if (currentTransaction.status.toLowerCase() != 'failed') {
      return { status: true, currentTransaction };
    }
  }
  return { status: false, currentTransaction };
};

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // grab current login customer
  const customer = req.user;

  const { amount, items, txnId } = <OrdersInput>req.body;

  if (customer) {
    // validate the txn
    const { status, currentTransaction } = await ValidateTransaction(txnId);
    if (!status) {
      return res.status(400).json({ message: 'Error with create order' });
    }

    // create order id
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const profile = await Customer.findById(customer._id);

    let cartItems = [];
    let netAmount = 0.0;
    let vendorId = '';

    // calculate order amount
    const foods = await Food.find()
      .where('_id')
      .in(items.map((item) => item._id))
      .exec();

    foods.map((food) => {
      items.map(({ _id, unit }) => {
        if (food._id.equals(_id)) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    // creeate order with item description
    if (cartItems) {
      const currentOrder = <OrderDoc>await Order.create({
        orderId: orderId,
        vendorId: vendorId,
        items: cartItems as any,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: 'Waiting',
        remarks: '',
        deliveryId: '',
        readyTime: 45,
      });

      if (currentOrder) {
        // Finally update orders to user account
        profile.cart = [] as any;
        profile.orders.push(currentOrder);

        currentTransaction.orderId = orderId;
        currentTransaction.vendorId = vendorId;
        currentTransaction.status = 'CONFIRMED';
        await currentTransaction.save();

        assignOrderForDelivery(currentOrder._id, vendorId);

        await profile.save();

        return res.status(200).json(currentOrder);
      }
    }
  }

  return res.status(400).json({ message: 'Error with creating order' });
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate('orders');
    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }
  return res.status(400).json({ message: 'Error with getting orders' });
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const orderId = req.params.id;

  if (customer) {
    const order = await Order.findById(orderId).populate('items.food');
    return res.status(200).json(order);
  }
  return res.status(400).json({ message: 'Error with getting orders' });
};

export const VerifyOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const offerId = req.params.id;
  const customer = req.user;

  if (customer) {
    const appliedOffer = await Offer.findById(offerId);
    if (appliedOffer) {
      if (appliedOffer.promoType == 'USER') {
        // only can applied once per user
      } else {
        if (appliedOffer.isActive) {
          return res
            .status(200)
            .json({ message: 'Offer is valid', offer: appliedOffer });
        }
      }
    }
  }
  return res.status(400).json({ message: 'Offer is not valid!' });
};
