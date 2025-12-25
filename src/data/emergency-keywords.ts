export const CRITICAL_EMERGENCY_KEYWORDS = [
    // Cardiac
    'heart attack',
    'crushing chest pain',
    'chest pressure radiating',
    'severe chest pain',

    // Respiratory
    "can't breathe",
    'gasping for air',
    'blue lips',
    'choking',
    'severe difficulty breathing',

    // Neurological
    'stroke',
    "can't speak",
    'face drooping',
    'worst headache of life',
    'sudden severe headache',
    'seizure',

    // Trauma
    'severe bleeding',
    'major trauma',
    'unconscious',
    'severe injury',

    // Mental Health
    'suicidal',
    'kill myself',
    'want to die',
    'harm myself',
    'harm others',
    'end my life',

    // Allergic
    'anaphylaxis',
    'throat swelling',
    'severe allergic reaction',

    // Other
    'severe pain',
    'vomiting blood',
    'coughing blood',
    'loss of consciousness',
    'confusion with fever',
    "can't control bladder",
    "can't control bowels",
];

export const URGENT_KEYWORDS = [
    'severe',
    'sudden',
    'intense',
    'unbearable',
    'emergency',
    'urgent',
    'immediate',
    'right now',
    'very bad',
    'getting worse',
];

export function detectEmergencyKeywords(text: string): {
    detected: boolean;
    keywords: string[];
    severity: 'critical' | 'urgent' | 'none';
} {
    const lowerText = text.toLowerCase();

    const criticalMatches = CRITICAL_EMERGENCY_KEYWORDS.filter((keyword) =>
        lowerText.includes(keyword.toLowerCase())
    );

    if (criticalMatches.length > 0) {
        return {
            detected: true,
            keywords: criticalMatches,
            severity: 'critical',
        };
    }

    const urgentMatches = URGENT_KEYWORDS.filter((keyword) =>
        lowerText.includes(keyword.toLowerCase())
    );

    if (urgentMatches.length > 0) {
        return {
            detected: true,
            keywords: urgentMatches,
            severity: 'urgent',
        };
    }

    return {
        detected: false,
        keywords: [],
        severity: 'none',
    };
}
