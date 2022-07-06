import { IsEmail, IsEmpty, Length } from 'class-validator';

export class CreateCustomerInputs {
  @IsEmail()
  email: string;

  @Length(6, 12)
  phone: string;

  @Length(6, 12)
  password: string;
}

export class CustomerLoginInputs {
  @IsEmail()
  email: string;

  @Length(6, 12)
  password: string;
}

export class EditCustomerProfileInputs {
  @Length(3, 16)
  firstName: string;

  @Length(3, 16)
  lastName: string;

  @Length(3, 128)
  address: string;
}

export class CartItem {
  _id: string;
  unit: number;
}

export class OrdersInput {
  txnId: string;
  amount: number;
  items: [CartItem];
}

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}
export class CreateDeliveryUserInputs {
  @IsEmail()
  email: string;

  @Length(6, 12)
  phone: string;

  @Length(6, 12)
  password: string;

  @Length(3, 16)
  firstName: string;

  @Length(3, 16)
  lastName: string;

  @Length(6, 128)
  address: string;

  @Length(4, 16)
  pincode: string;
}
