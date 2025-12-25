// Agent types
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}

export interface ChatRequest {
    message: string;
    sessionId: string;
    patientId?: string;
    conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
    message: string;
    sessionId: string;
    metadata?: {
        intent?: string;
        urgencyLevel?: 'routine' | 'urgent' | 'emergency';
        emergencyDetected?: boolean;
        emergencyType?: string;
        emergencyInstructions?: string;
        appointmentBooked?: boolean;
        [key: string]: any;
    };
}

export interface AssessSymptomsParams {
    primarySymptom: string;
    symptomDetails: {
        onset: string;
        duration: string;
        severity: number;
        location?: string;
        character?: string;
    };
    associatedSymptoms?: string[];
    redFlagSymptoms?: string[];
    patientContext?: {
        age?: number;
        isPregnant?: boolean;
        chronicConditions?: string[];
    };
}

export interface AssessmentResult {
    urgencyLevel: 'routine' | 'urgent' | 'emergency';
    severity: number;
    recommendedSpecialty: string;
    alternativeSpecialties?: string[];
    reasoning: string;
    nextSteps: string;
    estimatedWaitTime?: string;
    requiresImmediateEscalation: boolean;
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: any;
}

export interface LLMResponse {
    message: string;
    toolCalls?: ToolCall[];
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
