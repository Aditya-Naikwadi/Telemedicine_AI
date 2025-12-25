// Medical data types
export interface MedicalSpecialty {
    id: string;
    name: string;
    description: string;
    commonConditions: string[];
    typicalAppointmentDuration: number;
    urgencyCapabilities: {
        routine: boolean;
        urgent: boolean;
        emergency: boolean;
    };
    associatedSymptoms: string[];
    keywords: string[];
    availabilityNotes?: string;
}

export enum BodySystem {
    RESPIRATORY = 'respiratory',
    CARDIOVASCULAR = 'cardiovascular',
    GASTROINTESTINAL = 'gastrointestinal',
    NEUROLOGICAL = 'neurological',
    MUSCULOSKELETAL = 'musculoskeletal',
    DERMATOLOGICAL = 'dermatological',
    GENITOURINARY = 'genitourinary',
    ENDOCRINE = 'endocrine',
    PSYCHIATRIC = 'psychiatric',
    GENERAL = 'general',
}

export enum SeverityLevel {
    MILD = 'mild',
    MODERATE = 'moderate',
    SEVERE = 'severe',
    EMERGENCY = 'emergency',
}

export interface Symptom {
    id: string;
    name: string;
    category: BodySystem;
    severity: SeverityLevel[];
    associatedSpecialties: string[];
    redFlags: string[];
    followUpQuestions: string[];
    commonCauses: string[];
    emergencyKeywords: string[];
}

export interface Medication {
    name: string;
    dosage?: string;
    frequency?: string;
    indication?: string;
}

export interface Allergy {
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
}

export interface ChronicCondition {
    name: string;
    diagnosedDate?: string;
    status: 'active' | 'managed' | 'resolved';
}

export interface MedicalHistory {
    patientId: string;
    currentMedications?: Medication[];
    allergies?: Allergy[];
    chronicConditions?: ChronicCondition[];
    pastVisits?: any[];
    vaccinations?: any[];
    importantNotes?: string[];
}

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    medicalHistory?: MedicalHistory;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    acceptingPatients: boolean;
    office?: {
        address: string;
    };
}

export interface TimeSlot {
    id: string;
    doctorId: string;
    dateTime: Date;
    duration: number;
    isBooked: boolean;
    appointmentType: 'in-person' | 'telemedicine';
}

export interface Appointment {
    id: string;
    confirmationNumber: string;
    patientId: string;
    doctorId: string;
    dateTime: Date;
    type: 'in-person' | 'telemedicine';
    reason: string;
    specialty: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    doctor?: Doctor;
}

export interface CreatePatientData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
}

export interface CreateAppointmentData {
    patientId: string;
    doctorId: string;
    dateTime: Date;
    type: 'in-person' | 'telemedicine';
    reason: string;
    specialty: string;
}

export interface AvailabilityParams {
    startDate: Date;
    endDate: Date;
    timePreferences?: string[];
}
