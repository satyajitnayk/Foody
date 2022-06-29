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

export class OrdersInput {
  _id: string;
  unit: number;
}

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}
