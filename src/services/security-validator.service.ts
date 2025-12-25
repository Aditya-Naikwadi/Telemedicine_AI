import {
    ValidationRule,
    ValidationResult,
    ValidationError,
} from '../types/security.types';

/**
 * Security validation service for input sanitization and validation
 */
export class SecurityValidatorService {
    private static readonly DANGEROUS_PATTERNS = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, // SQL Injection
        /(javascript:|data:|vbscript:)/gi, // Protocol injection
        /(\.\.|\/etc\/|\/proc\/|\/sys\/)/gi, // Path traversal
        /(<iframe|<object|<embed|<applet)/gi, // Dangerous HTML tags
    ];

    /**
     * Sanitize user input to prevent injection attacks
     */
    static sanitizeInput(input: string): string {
        if (!input) return '';

        let sanitized = input;

        // Remove null bytes
        sanitized = sanitized.replace(/\0/g, '');

        // Encode HTML special characters
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');

        return sanitized.trim();
    }

    /**
     * Validate input against dangerous patterns
     */
    static validateAgainstInjection(input: string): {
        isValid: boolean;
        threats: string[];
    } {
        const threats: string[] = [];

        for (const pattern of this.DANGEROUS_PATTERNS) {
            if (pattern.test(input)) {
                threats.push(pattern.source);
            }
        }

        return {
            isValid: threats.length === 0,
            threats,
        };
    }

    /**
     * Validate data against rules
     */
    static validate(data: any, rules: ValidationRule[]): ValidationResult {
        const errors: ValidationError[] = [];
        const sanitizedData: any = {};

        for (const rule of rules) {
            const value = data[rule.field];

            // Check required
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} is required`,
                    code: 'REQUIRED',
                });
                continue;
            }

            if (value === undefined || value === null) {
                continue;
            }

            // Type validation
            if (rule.type === 'string' && typeof value !== 'string') {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} must be a string`,
                    code: 'INVALID_TYPE',
                });
                continue;
            }

            if (rule.type === 'number' && typeof value !== 'number') {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} must be a number`,
                    code: 'INVALID_TYPE',
                });
                continue;
            }

            // Length validation
            if (rule.minLength && value.length < rule.minLength) {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} must be at least ${rule.minLength} characters`,
                    code: 'MIN_LENGTH',
                });
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} must be at most ${rule.maxLength} characters`,
                    code: 'MAX_LENGTH',
                });
            }

            // Pattern validation
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} format is invalid`,
                    code: 'INVALID_FORMAT',
                });
            }

            // Email validation
            if (rule.type === 'email' && !this.isValidEmail(value)) {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} must be a valid email`,
                    code: 'INVALID_EMAIL',
                });
            }

            // Phone validation
            if (rule.type === 'phone' && !this.isValidPhone(value)) {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} must be a valid phone number`,
                    code: 'INVALID_PHONE',
                });
            }

            // Custom validator
            if (rule.customValidator && !rule.customValidator(value)) {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} failed custom validation`,
                    code: 'CUSTOM_VALIDATION_FAILED',
                });
            }

            // Sanitize if needed
            if (rule.sanitize && typeof value === 'string') {
                sanitizedData[rule.field] = this.sanitizeInput(value);
            } else {
                sanitizedData[rule.field] = value;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitizedData: errors.length === 0 ? sanitizedData : undefined,
        };
    }

    /**
     * Validate email format
     */
    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format
     */
    private static isValidPhone(phone: string): boolean {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    /**
     * Validate medical data specific fields
     */
    static validateMedicalData(data: any): ValidationResult {
        const rules: ValidationRule[] = [
            {
                field: 'symptom',
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 500,
                sanitize: true,
            },
            {
                field: 'severity',
                type: 'number',
                required: false,
            },
            {
                field: 'duration',
                type: 'string',
                required: false,
                maxLength: 200,
                sanitize: true,
            },
        ];

        return this.validate(data, rules);
    }

    /**
     * Validate session data
     */
    static validateSessionData(data: any): ValidationResult {
        const rules: ValidationRule[] = [
            {
                field: 'sessionId',
                type: 'string',
                required: true,
                minLength: 32,
                maxLength: 128,
            },
            {
                field: 'message',
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 10000,
                sanitize: true,
            },
        ];

        return this.validate(data, rules);
    }
}
