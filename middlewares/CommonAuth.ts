import { Request, Response, NextFunction } from 'express';
import { ValidateSignature } from '../utility';
import { AuthPayload } from '../dto';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validate = await ValidateSignature(req);
  if (validate) {
    next();
  } else {
    return res.json({
      message: 'User not authorized',
    });
  }
};
