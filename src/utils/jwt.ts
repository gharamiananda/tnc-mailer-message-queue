import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
  recipientId: string;
}

export function signToken(recipientId: string): string {
  return jwt.sign({ recipientId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}