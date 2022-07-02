import mongoose, { Schema, Document } from 'mongoose';

interface OfferDoc extends Document {
  offerType: string; //VENDOR // GENERIC
  vendors: [any]; // [vendorIds...]
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  promoType: string; //USER //ALL //BANK //CARD
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}

const OfferSchema = new Schema(
  {
    offerType: { type: String, required: true },
    vendors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'vendor',
      },
    ],
    title: { type: String, required: true },
    description: { type: String },
    minValue: { type: Number, required: true },
    offerAmount: { type: Number, required: true },
    startValidity: { type: Date },
    endValidity: { type: Date },
    promocode: { type: String, required: true },
    promoType: { type: String, required: true },
    bank: [{ type: String }],
    bins: [{ type: Number }],
    pincode: { type: String, required: true },
    isActive: { type: Boolean },
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

const Offer = mongoose.model<OfferDoc>('offer', OfferSchema);

export { Offer, OfferDoc };
