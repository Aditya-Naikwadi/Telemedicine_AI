import {
    PIIDetectionResult,
    PIILocation,
    PIIType,
    PIIProtectionConfig,
} from '../types/security.types';

/**
 * PII detection and masking service
 */
export class PIIDetectorService {
    private config: PIIProtectionConfig;

    // PII detection patterns
    private static readonly PII_PATTERNS: Record<
        PIIType,
        { pattern: RegExp; confidence: number }
    > = {
            ssn: {
                pattern: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
                confidence: 0.9,
            },
            email: {
                pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                confidence: 0.95,
            },
            phone: {
                pattern:
                    /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
                confidence: 0.85,
            },
            address: {
                pattern:
                    /\b\d{1,5}\s+([A-Z][a-z]+\s+){1,3}(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi,
                confidence: 0.7,
            },
            dob: {
                pattern:
                    /\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g,
                confidence: 0.8,
            },
            mrn: {
                pattern: /\b(MRN|Medical Record Number)[\s:]*\d{6,10}\b/gi,
                confidence: 0.9,
            },
            'credit-card': {
                pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
                confidence: 0.85,
            },
            name: {
                pattern: /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g,
                confidence: 0.5,
            },
        };

    constructor(config: PIIProtectionConfig) {
        this.config = config;
    }

    /**
     * Detect PII in text
     */
    detectPII(text: string): PIIDetectionResult {
        if (!this.config.enabled || !this.config.autoDetect) {
            return {
                hasPII: false,
                detectedTypes: [],
                locations: [],
            };
        }

        const detectedTypes: Set<PIIType> = new Set();
        const locations: PIILocation[] = [];

        for (const piiType of this.config.piiTypes) {
            const patternInfo = PIIDetectorService.PII_PATTERNS[piiType];
            if (!patternInfo) continue;

            const matches = text.matchAll(patternInfo.pattern);

            for (const match of matches) {
                if (match.index !== undefined) {
                    detectedTypes.add(piiType);
                    locations.push({
                        type: piiType,
                        start: match.index,
                        end: match.index + match[0].length,
                        value: match[0],
                        confidence: patternInfo.confidence,
                    });
                }
            }
        }

        return {
            hasPII: detectedTypes.size > 0,
            detectedTypes: Array.from(detectedTypes),
            locations,
            maskedText: this.config.maskInResponses
                ? this.maskPII(text, locations)
                : undefined,
        };
    }

    /**
     * Mask PII in text
     */
    maskPII(text: string, locations?: PIILocation[]): string {
        if (!this.config.enabled) {
            return text;
        }

        // If locations not provided, detect them first
        if (!locations) {
            const detection = this.detectPII(text);
            locations = detection.locations;
        }

        // Sort locations by start position (descending) to replace from end to start
        const sortedLocations = [...locations].sort((a, b) => b.start - a.start);

        let maskedText = text;

        for (const location of sortedLocations) {
            const maskChar = this.getMaskChar(location.type);
            const maskedValue = this.getMaskedValue(location.value, location.type);

            maskedText =
                maskedText.substring(0, location.start) +
                maskedValue +
                maskedText.substring(location.end);
        }

        return maskedText;
    }

    /**
     * Get masked value for PII type
     */
    private getMaskedValue(value: string, type: PIIType): string {
        switch (type) {
            case 'ssn':
                return '***-**-****';
            case 'email':
                const [localPart, domain] = value.split('@');
                return `${localPart[0]}***@${domain}`;
            case 'phone':
                return '***-***-****';
            case 'credit-card':
                return '**** **** **** ****';
            case 'mrn':
                return 'MRN: ******';
            case 'dob':
                return '**/**/****';
            case 'address':
                return '[ADDRESS REDACTED]';
            case 'name':
                return '[NAME REDACTED]';
            default:
                return '*'.repeat(value.length);
        }
    }

    /**
     * Get mask character for PII type
     */
    private getMaskChar(type: PIIType): string {
        return '*';
    }

    /**
     * Check if text contains PII
     */
    hasPII(text: string): boolean {
        const result = this.detectPII(text);
        return result.hasPII;
    }

    /**
     * Sanitize text for logging
     */
    sanitizeForLogging(text: string): string {
        if (!this.config.maskInLogs) {
            return text;
        }

        const detection = this.detectPII(text);
        return detection.maskedText || text;
    }

    /**
     * Get PII statistics
     */
    getPIIStats(text: string): Record<PIIType, number> {
        const stats: Record<PIIType, number> = {} as any;

        for (const piiType of this.config.piiTypes) {
            const patternInfo = PIIDetectorService.PII_PATTERNS[piiType];
            if (!patternInfo) continue;

            const matches = text.matchAll(patternInfo.pattern);
            stats[piiType] = Array.from(matches).length;
        }

        return stats;
    }
}
