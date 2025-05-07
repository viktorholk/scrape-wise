import jwt, { JwtPayload } from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

if (!secret) {
  throw new Error("JWT_SECRET is not set");
}

export interface Token extends JwtPayload {
  userId: string;
}

export function signToken(data: object): string {
  return jwt.sign(data, secret, { expiresIn: "24h" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default { signToken, verifyToken };
