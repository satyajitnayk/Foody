import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { VendorPayload } from '../dto';
import { AuthPayload } from '../dto/Auth.dto';
import { Request } from 'express';

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePasswordHash = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  storedPasswordHash: string,
  salt: string
) => {
  return (
    (await GeneratePasswordHash(enteredPassword, salt)) === storedPasswordHash
  );
};

export const GenerateSignature = (payload: VendorPayload) => {
  return jwt.sign(payload, JWT_SECRET ?? '', {
    expiresIn: '1d',
  });
};

export const ValidateSignature = async (req: Request) => {
  const signature = req.get('authorization');
  if (signature) {
    const payload = jwt.verify(
      signature.split(' ')[1],
      JWT_SECRET ?? ''
    ) as AuthPayload;
    req.user = payload;
    return true;
  }
  return false;
};
