import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Ensure you have a 32-byte hex string in your .env for production!
// For development, we can fallback or throw.
const SECRET_KEY_HEX = process.env.WALLET_SECRET || '0000000000000000000000000000000000000000000000000000000000000000';

// Convert hex string to Buffer
const getSecretKey = () => Buffer.from(SECRET_KEY_HEX, 'hex');

export function encrypt(text: string) {
    const iv = randomBytes(16);
    const key = getSecretKey();
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encryptedData: encrypted,
        iv: iv.toString('hex')
    };
}

export function decrypt(encryptedData: string, ivHex: string) {
    const iv = Buffer.from(ivHex, 'hex');
    const key = getSecretKey();
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
