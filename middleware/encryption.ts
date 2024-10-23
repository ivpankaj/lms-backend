// utils/decryption.ts
import crypto from 'crypto';

const secretKey = 'your-secret-key';
const algorithm = 'aes-256-cbc';

export const decryptData = (encryptedData: string): string => {
  const [iv, encrypted] = encryptedData.split(':'); // Extract the IV and the encrypted data
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
