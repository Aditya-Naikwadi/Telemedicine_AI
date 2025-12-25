export const TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: 'assessSymptoms',
            description:
                'Assess patient symptoms to determine severity, urgency level, and recommended medical specialty. Use this tool after gathering initial symptom information from the patient.',
            parameters: {
                type: 'object',
                properties: {
                    primarySymptom: {
                        type: 'string',
                        description:
                            "The main symptom the patient is experiencing (e.g., 'chest pain', 'headache', 'abdominal pain')",
                    },
                    symptomDetails: {
                        type: 'object',
                        description: 'Detailed information about the symptom',
                        properties: {
                            onset: {
                                type: 'string',
                                description:
                                    "When the symptom started (e.g., '2 hours ago', 'yesterday', '3 weeks')",
                            },
                            duration: {
                                type: 'string',
                                description:
                                    "How long the symptom lasts (e.g., 'constant', 'comes and goes', '30 minutes at a time')",
                            },
                            severity: {
                                type: 'number',
                                description: 'Pain/discomfort level on scale of 1-10',
                            },
                            location: {
                                type: 'string',
                                description: 'Where the symptom is located on the body',
                            },
                            character: {
                                type: 'string',
                                description:
                                    "Description of the symptom (e.g., 'sharp', 'dull', 'burning', 'throbbing')",
                            },
                        },
                    },
                    associatedSymptoms: {
                        type: 'array',
                        description: 'Other symptoms the patient is experiencing',
                        items: {
                            type: 'string',
                        },
                    },
                    redFlagSymptoms: {
                        type: 'array',
                        description: 'Any red flag or emergency symptoms detected',
                        items: {
                            type: 'string',
                        },
                    },
                },
                required: ['primarySymptom', 'symptomDetails'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'recommendSpecialty',
            description:
                'Recommend the most appropriate medical specialty based on patient symptoms and concerns.',
            parameters: {
                type: 'object',
                properties: {
                    symptoms: {
                        type: 'array',
                        description: 'List of patient symptoms',
                        items: {
                            type: 'string',
                        },
                    },
                    primaryConcern: {
                        type: 'string',
                        description: "Patient's main health concern",
                    },
                },
                required: ['symptoms', 'primaryConcern'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'escalateToEmergency',
            description:
                'Escalate to emergency protocols when life-threatening symptoms are detected. This triggers immediate notifications and provides emergency contact information.',
            parameters: {
                type: 'object',
                properties: {
                    emergencyType: {
                        type: 'string',
                        description: 'Type of emergency',
                        enum: [
                            'cardiac',
                            'respiratory',
                            'neurological',
                            'trauma',
                            'mental-health-crisis',
                            'allergic-reaction',
                            'other',
                        ],
                    },
                    symptoms: {
                        type: 'array',
                        description: 'Emergency symptoms detected',
                        items: {
                            type: 'string',
                        },
                    },
                },
                required: ['emergencyType', 'symptoms'],
            },
        },
    },
];
