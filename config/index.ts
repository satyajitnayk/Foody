import dotenv from 'dotenv';
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI!;
export const JWT_SECRET = process.env.JWT_SECRET!;
