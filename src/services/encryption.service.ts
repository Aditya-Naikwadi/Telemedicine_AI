import { EncryptedData, EncryptionConfig } from '../types/security.types';
import { encrypt, decrypt, generateEncryptionKey } from '../utils/crypto.utils';

/**
 * Encryption service for protecting sensitive data
 */
export class EncryptionService {
    private encryptionKey: Buffer;
    private config: EncryptionConfig;

    constructor(config: EncryptionConfig, encryptionKey?: Buffer) {
        this.config = config;
        this.encryptionKey = encryptionKey || generateEncryptionKey();
    }

    /**
     * Encrypt sensitive data
     */
    encryptData(plaintext: string): EncryptedData {
        if (!this.config.enabled) {
            throw new Error('Encryption is not enabled');
        }

        const { ciphertext, iv, tag } = encrypt(plaintext, this.encryptionKey);

        return {
            ciphertext,
            iv,
            tag,
            algorithm: this.config.algorithm,
            timestamp: new Date(),
        };
    }

    /**
     * Decrypt encrypted data
     */
    decryptData(encryptedData: EncryptedData): string {
        if (!this.config.enabled) {
            throw new Error('Encryption is not enabled');
        }

        return decrypt(
            encryptedData.ciphertext,
            this.encryptionKey,
            encryptedData.iv,
            encryptedData.tag
        );
    }

    /**
     * Encrypt PHI (Protected Health Information)
     */
    encryptPHI(phi: any): EncryptedData {
        if (!this.config.encryptPHI) {
            throw new Error('PHI encryption is not enabled');
        }

        const phiString = JSON.stringify(phi);
        return this.encryptData(phiString);
    }

    /**
     * Decrypt PHI
     */
    decryptPHI(encryptedPHI: EncryptedData): any {
        const decryptedString = this.decryptData(encryptedPHI);
        return JSON.parse(decryptedString);
    }

    /**
     * Rotate encryption key
     */
    rotateKey(newKey: Buffer): void {
        this.encryptionKey = newKey;
    }

    /**
     * Get encryption key (for backup/storage purposes)
     */
    getEncryptionKey(): Buffer {
        return this.encryptionKey;
    }

    /**
     * Check if encryption is enabled
     */
    isEnabled(): boolean {
        return this.config.enabled;
    }
}
