import mongoose, { Schema, Document } from 'mongoose';

interface DeliveryUserDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  verified: boolean;
  pincode: string;
}

const DeliveryUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phone: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    isAvailable: { type: Boolean },
    verified: { type: Boolean, default: false },
    pincode: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const DeliveryUser = mongoose.model<DeliveryUserDoc>(
  'delivery_user',
  DeliveryUserSchema
);

export { DeliveryUser };
