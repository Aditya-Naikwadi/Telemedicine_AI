# Security Documentation

## Overview

The TeleMedicine AI Agent package implements enterprise-grade security features to protect patient data and ensure HIPAA compliance. This document outlines the security architecture, features, and best practices.

## Security Architecture

### Multi-Layer Security Approach

1. **Input Validation Layer** - Sanitizes and validates all user inputs
2. **Rate Limiting Layer** - Prevents abuse and DoS attacks
3. **Session Management Layer** - Secure session handling with validation
4. **Encryption Layer** - AES-256-GCM encryption for sensitive data
5. **Audit Logging Layer** - Comprehensive HIPAA-compliant audit trails
6. **PII Protection Layer** - Automatic detection and masking of sensitive information

## Security Features

### 1. Input Validation & Sanitization

**Purpose**: Prevent injection attacks (XSS, SQL injection, etc.)

**Features**:
- HTML entity encoding
- Null byte removal
- Pattern-based threat detection
- Field-level validation rules
- Custom validation support

**Usage**:
```typescript
import { SecurityValidatorService } from 'telemed-ai-agent';

// Automatic sanitization in agent
const result = SecurityValidatorService.validateSessionData({
    sessionId: 'session-123',
    message: userInput
});
```

**Protected Against**:
- Cross-Site Scripting (XSS)
- SQL Injection
- Path Traversal
- Protocol Injection
- Dangerous HTML tags

### 2. Data Encryption

**Standard**: AES-256-GCM (NIST approved)

**Features**:
- Encryption at rest for PHI
- Secure key management
- Key rotation support (configurable)
- Authentication tags for integrity

**Configuration**:
```typescript
const agent = new TelemedAgent({
    security: {
        encryption: {
            enabled: true,
            algorithm: 'aes-256-gcm',
            keyRotationDays: 90,
            encryptPHI: true,
            encryptLogs: false
        }
    }
});
```

**Best Practices**:
- Store encryption keys securely (use environment variables or key management services)
- Rotate keys every 90 days
- Never log encryption keys
- Use separate keys for different environments

### 3. Audit Logging

**Compliance**: HIPAA-compliant audit trails

**Logged Events**:
- PHI access (who, what, when)
- Authentication attempts
- Security events
- Configuration changes
- Emergency situations
- Rate limit violations

**Configuration**:
```typescript
security: {
    auditLogging: {
        enabled: true,
        logLevel: 'standard', // 'minimal' | 'standard' | 'detailed'
        retentionDays: 2555, // 7 years for HIPAA
        logPHIAccess: true,
        logAuthEvents: true,
        logSecurityEvents: true,
        encryptLogs: false
    }
}
```

**Retention**: 7 years (2555 days) as required by HIPAA

**Export Formats**: JSON, CSV

### 4. Rate Limiting

**Purpose**: Prevent abuse, brute force attacks, and DoS

**Features**:
- Per-session rate limits
- Configurable thresholds
- Automatic blocking
- Whitelist support

**Default Limits**:
- 60 requests per minute
- 1000 requests per hour
- 15-minute block duration

**Configuration**:
```typescript
security: {
    rateLimiting: {
        enabled: true,
        maxRequestsPerMinute: 60,
        maxRequestsPerHour: 1000,
        blockDurationMinutes: 15,
        whitelistedSessions: []
    }
}
```

### 5. PII Detection & Masking

**Detected PII Types**:
- Social Security Numbers (SSN)
- Email addresses
- Phone numbers
- Physical addresses
- Dates of birth
- Medical Record Numbers (MRN)
- Credit card numbers
- Names

**Features**:
- Automatic detection using regex patterns
- Confidence scoring
- Automatic masking in logs
- Optional masking in responses

**Configuration**:
```typescript
security: {
    piiProtection: {
        enabled: true,
        autoDetect: true,
        maskInLogs: true,
        maskInResponses: false,
        piiTypes: ['ssn', 'email', 'phone', 'dob', 'mrn', 'credit-card']
    }
}
```

**Example**:
```
Input:  "My SSN is 123-45-6789"
Logged: "My SSN is ***-**-****"
```

### 6. Session Management

**Features**:
- Secure session ID generation (32-byte random)
- Session expiration (configurable timeout)
- IP validation (optional)
- Concurrent session limits
- Automatic cleanup

**Configuration**:
```typescript
security: {
    sessionManagement: {
        sessionTimeout: 30, // minutes
        requireTokenValidation: true,
        maxConcurrentSessions: 5,
        enforceIPValidation: false
    }
}
```

**Security Measures**:
- Cryptographically secure random session IDs
- Session hijacking detection (IP validation)
- Automatic expiration
- Session invalidation on security events

## HIPAA Compliance

### Protected Health Information (PHI)

The package automatically identifies and protects PHI:

1. **Encryption**: All PHI is encrypted at rest using AES-256-GCM
2. **Access Logging**: All PHI access is logged with user ID, timestamp, and action
3. **Audit Trails**: 7-year retention of all PHI access logs
4. **Minimum Necessary**: Only required data is processed
5. **Data Integrity**: Authentication tags ensure data hasn't been tampered with

### Compliance Features

✅ **Access Controls**: Session validation and authentication  
✅ **Audit Controls**: Comprehensive audit logging  
✅ **Integrity Controls**: Encryption with authentication tags  
✅ **Transmission Security**: Encrypted data transmission  
✅ **Person/Entity Authentication**: Session management  

### Breach Notification

Security events are logged with severity levels:
- **Critical**: Immediate notification required
- **High**: Review within 24 hours
- **Medium**: Review within 72 hours
- **Low**: Routine monitoring

## Security Best Practices

### For Developers

1. **Never Log Sensitive Data**
   ```typescript
   // ❌ Bad
   console.log('User data:', userData);
   
   // ✅ Good
   logger.info('User data processed', { userId: user.id });
   ```

2. **Always Validate Input**
   ```typescript
   // Validation is automatic in the agent
   // But for custom implementations:
   const result = SecurityValidatorService.validate(data, rules);
   if (!result.isValid) {
       throw new Error('Validation failed');
   }
   ```

3. **Use Environment Variables for Secrets**
   ```typescript
   const agent = new TelemedAgent({
       llm: {
           apiKey: process.env.OPENAI_API_KEY
       }
   });
   ```

4. **Enable All Security Features**
   ```typescript
   // Use default security config or customize
   const agent = new TelemedAgent({
       security: {
           encryption: { enabled: true },
           rateLimiting: { enabled: true },
           auditLogging: { enabled: true },
           piiProtection: { enabled: true }
       }
   });
   ```

5. **Monitor Audit Logs**
   ```typescript
   // Regularly export and review audit logs
   const logs = agent.auditLogger.exportLogs('json');
   ```

### For Deployment

1. **Use HTTPS**: Always deploy with TLS/SSL
2. **Secure Environment**: Use secure environment variable management
3. **Key Rotation**: Rotate encryption keys every 90 days
4. **Access Control**: Limit who can access the system
5. **Monitoring**: Set up alerts for security events
6. **Backups**: Regularly backup audit logs
7. **Updates**: Keep dependencies up to date

## Security Checklist

Before deploying to production:

- [ ] HTTPS/TLS enabled
- [ ] Environment variables configured securely
- [ ] Encryption enabled for PHI
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] PII detection enabled
- [ ] Session timeout configured appropriately
- [ ] Audit log retention set to 7 years
- [ ] Security monitoring in place
- [ ] Incident response plan documented
- [ ] Regular security audits scheduled

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to: [security@yourorg.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Updates

Stay informed about security updates:
- Subscribe to package updates
- Review CHANGELOG for security fixes
- Test updates in staging before production
- Have a rollback plan

## Additional Resources

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Last Updated**: 2025-12-25  
**Version**: 1.0.0
