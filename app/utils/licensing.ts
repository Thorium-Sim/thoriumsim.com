import crypto from 'node:crypto'
import { getLicenseSigningKey } from './r2.ts';

export async function generateLicense(thoriumId: string) {
  const privateKey = await getLicenseSigningKey()
  const signature = crypto.sign(null, thoriumId, privateKey);
  const sigString = signature.toString('base64url');

  return sigString;
}