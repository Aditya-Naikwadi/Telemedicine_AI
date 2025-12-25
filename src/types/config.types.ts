// Configuration types
export interface TelemedAgentConfig {
    llm: LLMConfig;
    organization: OrganizationConfig;
    database?: DatabaseConfig;
    features?: FeatureConfig;
    compliance?: ComplianceConfig;
    scheduling?: SchedulingConfig;
    logging?: LoggingConfig;
    emergency?: EmergencyConfig;
}

export interface LLMConfig {
    provider: 'openai' | 'anthropic' | 'custom';
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    customEndpoint?: string;
    customProvider?: any;
}

export interface OrganizationConfig {
    name: string;
    supportEmail: string;
    supportPhone?: string;
    website?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    branding?: {
        primaryColor?: string;
        logoUrl?: string;
    };
}

export interface DatabaseConfig {
    adapter: 'custom' | 'built-in';
    customAdapter?: any;
    type?: 'postgresql' | 'mongodb' | 'mysql';
    connectionString?: string;
    options?: Record<string, any>;
}

export interface FeatureConfig {
    symptomAssessment?: boolean;
    appointmentScheduling?: boolean;
    medicationLookup?: boolean;
    emergencyDetection?: boolean;
    medicalHistoryAccess?: boolean;
    insuranceVerification?: boolean;
    telemedicineSupport?: boolean;
}

export interface ComplianceConfig {
    hipaaMode?: boolean;
    auditLogging?: boolean;
    dataRetentionDays?: number;
    requireConsent?: boolean;
    disclaimerFrequency?: 'once' | 'every-session' | 'every-message';
    piiDetection?: boolean;
}

export interface SchedulingConfig {
    defaultAppointmentDuration?: number;
    bufferBetweenAppointments?: number;
    advanceBookingDays?: number;
    cancellationPolicyHours?: number;
    timeZone?: string;
    businessHours?: {
        [day: string]: { open: string; close: string } | null;
    };
}

export interface LoggingConfig {
    level?: 'error' | 'warn' | 'info' | 'debug';
    destination?: 'console' | 'file' | 'custom';
    filePath?: string;
    customLogger?: any;
    includeTimestamp?: boolean;
    includePII?: boolean;
}

export interface EmergencyConfig {
    emergencyNumber?: string;
    hospitalEmergencyLine?: string;
    nearestERAddress?: string;
    mentalHealthCrisisLine?: string;
    poisonControlNumber?: string;
    autoNotifyStaff?: boolean;
    notificationWebhook?: string;
}
