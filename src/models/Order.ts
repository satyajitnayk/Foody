import mongoose, { Schema, Document } from 'mongoose';

interface OrderDoc extends Document {
  orderId: string;
  vendorId: String;
  items: [any]; //[{food, unit}]
  totalAmount: number;
  paidAmount: number;
  orderDate: Date;
  orderStatus: string;
  remarks: string;
  deliveryId: string;
  readyTime: Number; // max 60 min
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    vendorId: { type: String, required: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: 'food', required: true },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    orderDate: { type: Date },
    orderStatus: { type: String },
    remarks: { type: String },
    deliveryId: { type: String },
    readyTime: { type: Number },
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export { Order, OrderDoc };
