// Security-related type definitions

export interface SecurityConfig {
    encryption: EncryptionConfig;
    rateLimiting: RateLimitConfig;
    auditLogging: AuditLogConfig;
    piiProtection: PIIProtectionConfig;
    sessionManagement: SessionConfig;
}

export interface EncryptionConfig {
    enabled: boolean;
    algorithm: 'aes-256-gcm' | 'aes-256-cbc';
    keyRotationDays: number;
    encryptPHI: boolean;
    encryptLogs: boolean;
}

export interface RateLimitConfig {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    blockDurationMinutes: number;
    whitelistedSessions: string[];
}

export interface AuditLogConfig {
    enabled: boolean;
    logLevel: 'minimal' | 'standard' | 'detailed';
    retentionDays: number;
    logPHIAccess: boolean;
    logAuthEvents: boolean;
    logSecurityEvents: boolean;
    encryptLogs: boolean;
}

export interface PIIProtectionConfig {
    enabled: boolean;
    autoDetect: boolean;
    maskInLogs: boolean;
    maskInResponses: boolean;
    piiTypes: PIIType[];
}

export type PIIType =
    | 'ssn'
    | 'email'
    | 'phone'
    | 'address'
    | 'dob'
    | 'mrn'
    | 'credit-card'
    | 'name';

export interface SessionConfig {
    sessionTimeout: number; // minutes
    requireTokenValidation: boolean;
    maxConcurrentSessions: number;
    enforceIPValidation: boolean;
}

// Audit Log Types
export interface AuditLog {
    id: string;
    timestamp: Date;
    eventType: AuditEventType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    sessionId: string;
    ipAddress?: string;
    action: string;
    resource?: string;
    outcome: 'success' | 'failure' | 'blocked';
    metadata?: Record<string, any>;
    phiAccessed?: boolean;
}

export type AuditEventType =
    | 'authentication'
    | 'authorization'
    | 'data-access'
    | 'data-modification'
    | 'phi-access'
    | 'security-event'
    | 'configuration-change'
    | 'emergency-event'
    | 'rate-limit-exceeded'
    | 'validation-failure';

// Encryption Types
export interface EncryptedData {
    ciphertext: string;
    iv: string;
    tag: string;
    algorithm: string;
    timestamp: Date;
}

export interface EncryptionKey {
    id: string;
    key: Buffer;
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
}

// Validation Types
export interface ValidationRule {
    field: string;
    type: 'string' | 'number' | 'email' | 'phone' | 'date';
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: any) => boolean;
    sanitize?: boolean;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    sanitizedData?: any;
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

// Rate Limiting Types
export interface RateLimitEntry {
    sessionId: string;
    ipAddress?: string;
    requestCount: number;
    windowStart: Date;
    isBlocked: boolean;
    blockedUntil?: Date;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
}

// PII Detection Types
export interface PIIDetectionResult {
    hasPII: boolean;
    detectedTypes: PIIType[];
    locations: PIILocation[];
    maskedText?: string;
}

export interface PIILocation {
    type: PIIType;
    start: number;
    end: number;
    value: string;
    confidence: number;
}

// Session Types
export interface SecureSession {
    sessionId: string;
    userId?: string;
    patientId?: string;
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    isValid: boolean;
    metadata?: Record<string, any>;
}

export interface SessionValidationResult {
    isValid: boolean;
    session?: SecureSession;
    reason?: string;
}

// Security Event Types
export interface SecurityEvent {
    id: string;
    timestamp: Date;
    type: SecurityEventType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    sessionId?: string;
    userId?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
    requiresNotification: boolean;
}

export type SecurityEventType =
    | 'suspicious-activity'
    | 'multiple-failed-attempts'
    | 'rate-limit-exceeded'
    | 'invalid-token'
    | 'session-hijack-attempt'
    | 'injection-attempt'
    | 'unauthorized-access'
    | 'data-breach-attempt';
