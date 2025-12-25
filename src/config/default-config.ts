import { TelemedAgentConfig } from '../types';

export const DEFAULT_CONFIG: Partial<TelemedAgentConfig> = {
    llm: {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: '',
    },

    features: {
        symptomAssessment: true,
        appointmentScheduling: true,
        medicationLookup: true,
        emergencyDetection: true,
        medicalHistoryAccess: true,
        insuranceVerification: false,
        telemedicineSupport: true,
    },

    compliance: {
        hipaaMode: true,
        auditLogging: true,
        dataRetentionDays: 2555, // 7 years
        requireConsent: true,
        disclaimerFrequency: 'every-session',
        piiDetection: true,
    },

    scheduling: {
        defaultAppointmentDuration: 30,
        bufferBetweenAppointments: 10,
        advanceBookingDays: 90,
        cancellationPolicyHours: 24,
        timeZone: 'America/New_York',
        businessHours: {
            monday: { open: '08:00', close: '17:00' },
            tuesday: { open: '08:00', close: '17:00' },
            wednesday: { open: '08:00', close: '17:00' },
            thursday: { open: '08:00', close: '17:00' },
            friday: { open: '08:00', close: '17:00' },
            saturday: null,
            sunday: null,
        },
    },

    logging: {
        level: 'info',
        destination: 'console',
        includeTimestamp: true,
        includePII: false,
    },

    emergency: {
        emergencyNumber: '911',
        mentalHealthCrisisLine: '988',
        poisonControlNumber: '1-800-222-1222',
        autoNotifyStaff: true,
    },

    security: {
        encryption: {
            enabled: true,
            algorithm: 'aes-256-gcm',
            keyRotationDays: 90,
            encryptPHI: true,
            encryptLogs: false,
        },
        rateLimiting: {
            enabled: true,
            maxRequestsPerMinute: 60,
            maxRequestsPerHour: 1000,
            blockDurationMinutes: 15,
            whitelistedSessions: [],
        },
        auditLogging: {
            enabled: true,
            logLevel: 'standard',
            retentionDays: 2555, // 7 years for HIPAA
            logPHIAccess: true,
            logAuthEvents: true,
            logSecurityEvents: true,
            encryptLogs: false,
        },
        piiProtection: {
            enabled: true,
            autoDetect: true,
            maskInLogs: true,
            maskInResponses: false,
            piiTypes: ['ssn', 'email', 'phone', 'dob', 'mrn', 'credit-card'],
        },
        sessionManagement: {
            sessionTimeout: 30, // minutes
            requireTokenValidation: true,
            maxConcurrentSessions: 5,
            enforceIPValidation: false,
        },
    },

    performance: {
        loadBalancing: {
            enabled: false, // Enable when using multiple instances
            strategy: 'round-robin',
            healthCheckInterval: 30000, // 30 seconds
            unhealthyThreshold: 3,
            healthyThreshold: 2,
            instances: [],
        },
        caching: {
            enabled: true,
            type: 'memory',
            ttl: 3600, // 1 hour
            maxSize: 100, // 100 MB
            strategy: 'lru',
            keyPrefix: 'telemed',
        },
        connectionPool: {
            enabled: true,
            minConnections: 2,
            maxConnections: 10,
            acquireTimeout: 30000,
            idleTimeout: 60000,
            retryAttempts: 3,
            retryDelay: 1000,
        },
        circuitBreaker: {
            enabled: true,
            failureThreshold: 5,
            successThreshold: 2,
            timeout: 30000,
            resetTimeout: 60000,
            monitoringPeriod: 10000,
        },
        queue: {
            enabled: true,
            maxSize: 1000,
            strategy: 'priority',
            timeout: 60000,
            concurrency: 10,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 60000, // 1 minute
            healthCheckEndpoint: true,
            detailedMetrics: false,
            alertThresholds: {
                cpuUsage: 80,
                memoryUsage: 85,
                responseTime: 5000,
                errorRate: 5,
                queueSize: 800,
            },
        },
    },
};
