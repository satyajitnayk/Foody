export interface CreateVendorInput {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface EditVendorInput {
  name: string;
  address: string;
  phone: string;
  foodType: [string];
}

export interface VendorLoginInput {
  email: string;
  password: string;
}

export interface VendorPayload {
  _id: string;
  emial: string;
  name: string;
  foodType: [string];
}

export interface CreateOfferInput {
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
