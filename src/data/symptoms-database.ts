import { Symptom, BodySystem, SeverityLevel } from '../types';

export const SYMPTOMS_DATABASE: Symptom[] = [
    // Respiratory
    {
        id: 'cough',
        name: 'Cough',
        category: BodySystem.RESPIRATORY,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE],
        associatedSpecialties: ['general-practice', 'pulmonology'],
        redFlags: ['coughing blood', 'severe difficulty breathing', 'chest pain with cough', 'high fever with cough'],
        followUpQuestions: [
            'How long have you had this cough?',
            'Is it a dry cough or are you producing mucus?',
            'Do you have any fever?',
        ],
        commonCauses: ['Common cold', 'Flu', 'Allergies', 'Asthma', 'Bronchitis'],
        emergencyKeywords: ['blood', "can't breathe", 'choking', 'blue lips'],
    },
    {
        id: 'shortness-of-breath',
        name: 'Shortness of Breath',
        category: BodySystem.RESPIRATORY,
        severity: [SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.EMERGENCY],
        associatedSpecialties: ['cardiology', 'pulmonology', 'general-practice'],
        redFlags: ['sudden onset', 'chest pain', 'blue lips or fingernails', 'confusion'],
        followUpQuestions: [
            'When did this start?',
            'Is it worse with activity or at rest?',
            'Do you have any chest pain?',
        ],
        commonCauses: ['Asthma', 'COPD', 'Heart failure', 'Anxiety', 'Pneumonia'],
        emergencyKeywords: ["can't breathe", 'gasping', 'blue', 'chest pain', 'sudden', 'severe'],
    },
    // Cardiovascular
    {
        id: 'chest-pain',
        name: 'Chest Pain',
        category: BodySystem.CARDIOVASCULAR,
        severity: [SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.EMERGENCY],
        associatedSpecialties: ['cardiology', 'general-practice'],
        redFlags: ['crushing or squeezing sensation', 'pain radiating to arm, jaw, or back', 'shortness of breath', 'sweating', 'nausea'],
        followUpQuestions: [
            'Where exactly is the pain located?',
            'Does the pain radiate anywhere?',
            'How long have you had this pain?',
        ],
        commonCauses: ['Heart attack', 'Angina', 'GERD', 'Anxiety', 'Muscle strain'],
        emergencyKeywords: ['heart attack', 'crushing', 'radiating', "can't breathe", 'severe', 'sudden'],
    },
    {
        id: 'palpitations',
        name: 'Palpitations',
        category: BodySystem.CARDIOVASCULAR,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE],
        associatedSpecialties: ['cardiology', 'general-practice'],
        redFlags: ['chest pain', 'fainting', 'severe dizziness', 'shortness of breath'],
        followUpQuestions: [
            'How often do you experience palpitations?',
            'Do you feel dizzy or lightheaded?',
        ],
        commonCauses: ['Anxiety', 'Caffeine', 'Arrhythmia', 'Thyroid problems'],
        emergencyKeywords: ['chest pain', 'fainting', 'severe', "can't breathe"],
    },
    // Gastrointestinal
    {
        id: 'abdominal-pain',
        name: 'Abdominal Pain',
        category: BodySystem.GASTROINTESTINAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.EMERGENCY],
        associatedSpecialties: ['gastroenterology', 'general-practice'],
        redFlags: ['severe sudden pain', 'rigid abdomen', 'vomiting blood', 'blood in stool', 'fever with pain'],
        followUpQuestions: [
            'Where is the pain located?',
            'When did it start?',
            'Do you have any nausea or vomiting?',
        ],
        commonCauses: ['Gastroenteritis', 'Constipation', 'Gas', 'IBS', 'Appendicitis'],
        emergencyKeywords: ['severe', 'sudden', 'blood', 'vomiting blood', 'rigid'],
    },
    {
        id: 'nausea-vomiting',
        name: 'Nausea and Vomiting',
        category: BodySystem.GASTROINTESTINAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE],
        associatedSpecialties: ['gastroenterology', 'general-practice'],
        redFlags: ['vomiting blood', 'severe abdominal pain', 'signs of dehydration', 'severe headache'],
        followUpQuestions: [
            'How long have you been experiencing this?',
            'Is there any blood in the vomit?',
            'Are you able to keep fluids down?',
        ],
        commonCauses: ['Gastroenteritis', 'Food poisoning', 'Pregnancy', 'Migraine'],
        emergencyKeywords: ['blood', 'severe pain', 'dehydrated', 'head injury'],
    },
    // Neurological
    {
        id: 'headache',
        name: 'Headache',
        category: BodySystem.NEUROLOGICAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.EMERGENCY],
        associatedSpecialties: ['neurology', 'general-practice'],
        redFlags: ['worst headache of life', 'sudden severe headache', 'headache with fever and stiff neck', 'vision changes', 'confusion'],
        followUpQuestions: [
            'Where is the headache located?',
            'How would you describe the pain?',
            'Do you have any other symptoms?',
        ],
        commonCauses: ['Tension headache', 'Migraine', 'Sinus infection', 'Dehydration'],
        emergencyKeywords: ['worst headache', 'sudden', 'stiff neck', 'confusion', 'vision loss'],
    },
    {
        id: 'dizziness',
        name: 'Dizziness',
        category: BodySystem.NEUROLOGICAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE],
        associatedSpecialties: ['neurology', 'cardiology', 'general-practice'],
        redFlags: ['chest pain', 'severe headache', 'vision changes', 'difficulty speaking', 'weakness'],
        followUpQuestions: [
            'Is the room spinning or do you feel lightheaded?',
            'When did this start?',
            'Do you have any hearing changes?',
        ],
        commonCauses: ['Benign positional vertigo', 'Inner ear infection', 'Low blood pressure'],
        emergencyKeywords: ['chest pain', "can't speak", 'weakness', 'severe headache'],
    },
    // Musculoskeletal
    {
        id: 'joint-pain',
        name: 'Joint Pain',
        category: BodySystem.MUSCULOSKELETAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE],
        associatedSpecialties: ['orthopedics', 'general-practice'],
        redFlags: ['severe swelling', 'redness and warmth', 'fever', 'inability to use joint'],
        followUpQuestions: [
            'Which joint(s) are affected?',
            'Did you injure the joint?',
            'Is there any swelling or redness?',
        ],
        commonCauses: ['Arthritis', 'Injury', 'Overuse', 'Gout'],
        emergencyKeywords: ['severe swelling', 'fever', "can't move", 'deformed'],
    },
    {
        id: 'back-pain',
        name: 'Back Pain',
        category: BodySystem.MUSCULOSKELETAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.EMERGENCY],
        associatedSpecialties: ['orthopedics', 'neurology', 'general-practice'],
        redFlags: ['loss of bowel/bladder control', 'numbness in groin area', 'severe weakness in legs', 'fever with back pain'],
        followUpQuestions: [
            'Where is the pain located?',
            'Does the pain radiate anywhere?',
            'Do you have any numbness or tingling?',
        ],
        commonCauses: ['Muscle strain', 'Herniated disc', 'Arthritis', 'Poor posture'],
        emergencyKeywords: ["can't control bladder", "can't control bowels", "can't walk"],
    },
    // Dermatological
    {
        id: 'rash',
        name: 'Rash',
        category: BodySystem.DERMATOLOGICAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.EMERGENCY],
        associatedSpecialties: ['dermatology', 'general-practice'],
        redFlags: ['difficulty breathing', 'swelling of face/throat', 'fever with rash', 'spreading rapidly'],
        followUpQuestions: [
            'When did the rash appear?',
            'Is it itchy or painful?',
            'Have you been exposed to anything new?',
        ],
        commonCauses: ['Allergic reaction', 'Eczema', 'Contact dermatitis', 'Viral infection'],
        emergencyKeywords: ["can't breathe", 'swelling', 'anaphylaxis', 'severe'],
    },
    // Psychiatric
    {
        id: 'anxiety',
        name: 'Anxiety',
        category: BodySystem.PSYCHIATRIC,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE],
        associatedSpecialties: ['psychiatry', 'general-practice'],
        redFlags: ['suicidal thoughts', 'thoughts of harming others', 'inability to function', 'severe panic attacks'],
        followUpQuestions: [
            'How long have you been experiencing anxiety?',
            'What triggers your anxiety?',
            'Do you have any thoughts of self-harm?',
        ],
        commonCauses: ['Generalized anxiety disorder', 'Panic disorder', 'Social anxiety', 'PTSD'],
        emergencyKeywords: ['suicidal', 'self-harm', 'harm others', 'crisis'],
    },
    {
        id: 'depression',
        name: 'Depression',
        category: BodySystem.PSYCHIATRIC,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.EMERGENCY],
        associatedSpecialties: ['psychiatry', 'general-practice'],
        redFlags: ['suicidal thoughts', 'thoughts of self-harm', 'inability to care for self'],
        followUpQuestions: [
            'How long have you felt this way?',
            'Do you have thoughts of harming yourself?',
            'How is this affecting your daily activities?',
        ],
        commonCauses: ['Major depressive disorder', 'Situational depression', 'Bipolar disorder'],
        emergencyKeywords: ['suicidal', 'kill myself', 'self-harm', 'want to die', 'no reason to live'],
    },
    // General
    {
        id: 'fever',
        name: 'Fever',
        category: BodySystem.GENERAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.EMERGENCY],
        associatedSpecialties: ['general-practice', 'pediatrics'],
        redFlags: ['temperature >103°F', 'fever in infant <3 months', 'stiff neck', 'severe headache', 'confusion'],
        followUpQuestions: [
            'What is your temperature?',
            'How long have you had the fever?',
            'Do you have any other symptoms?',
        ],
        commonCauses: ['Viral infection', 'Bacterial infection', 'Flu', 'COVID-19'],
        emergencyKeywords: ['very high', 'infant', 'stiff neck', 'seizure', 'confused'],
    },
    {
        id: 'fatigue',
        name: 'Fatigue',
        category: BodySystem.GENERAL,
        severity: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE],
        associatedSpecialties: ['general-practice', 'endocrinology'],
        redFlags: ['sudden severe fatigue', 'chest pain', 'shortness of breath', 'unexplained weight loss'],
        followUpQuestions: [
            'How long have you been feeling fatigued?',
            'Does rest help?',
            'How is your sleep?',
        ],
        commonCauses: ['Poor sleep', 'Stress', 'Anemia', 'Thyroid problems', 'Depression'],
        emergencyKeywords: ['chest pain', "can't breathe", 'sudden severe'],
    },
];

export function getSymptomById(id: string): Symptom | undefined {
    return SYMPTOMS_DATABASE.find((s) => s.id === id);
}

export function searchSymptoms(query: string): Symptom[] {
    const lowerQuery = query.toLowerCase();
    return SYMPTOMS_DATABASE.filter(
        (s) =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.commonCauses.some((c) => c.toLowerCase().includes(lowerQuery))
    );
}
