import crypto from 'crypto';

/**
 * Cryptographic utilities for secure data handling
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;

/**
 * Generate a secure random encryption key
 */
export function generateEncryptionKey(): Buffer {
    return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Generate a secure random initialization vector
 */
export function generateIV(): Buffer {
    return crypto.randomBytes(IV_LENGTH);
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(
    plaintext: string,
    key: Buffer
): { ciphertext: string; iv: string; tag: string } {
    const iv = generateIV();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
        ciphertext,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
    };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(
    ciphertext: string,
    key: Buffer,
    iv: string,
    tag: string
): string {
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
}

/**
 * Hash data using SHA-256
 */
export function hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash password with salt using PBKDF2
 */
export function hashPassword(
    password: string,
    salt?: string
): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(SALT_LENGTH).toString('hex');

    const hash = crypto
        .pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512')
        .toString('hex');

    return { hash, salt: actualSalt };
}

/**
 * Verify password against hash
 */
export function verifyPassword(
    password: string,
    hash: string,
    salt: string
): boolean {
    const { hash: newHash } = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(newHash));
}

/**
 * Generate HMAC signature
 */
export function generateHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(
    data: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = generateHMAC(data, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(
    data: string,
    visibleChars: number = 4
): string {
    if (data.length <= visibleChars) {
        return '*'.repeat(data.length);
    }
    return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars);
}

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
    return generateSecureToken(32);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
