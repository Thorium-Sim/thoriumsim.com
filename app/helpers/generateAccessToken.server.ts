import crypto from "crypto";
export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString("base64");
}
