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
};
