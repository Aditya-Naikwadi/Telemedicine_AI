import { detectEmergencyKeywords } from '../data';

export interface EmergencyDetectionResult {
    isEmergency: boolean;
    emergencyType?:
    | 'cardiac'
    | 'respiratory'
    | 'neurological'
    | 'trauma'
    | 'mental-health-crisis'
    | 'allergic-reaction'
    | 'other';
    confidence: number;
    keywords: string[];
    requiresImmediateIntervention: boolean;
    reasoning: string;
}

export class EmergencyDetectionService {
    detectEmergency(messages: string[]): EmergencyDetectionResult {
        const combinedText = messages.join(' ').toLowerCase();

        const keywordDetection = detectEmergencyKeywords(combinedText);

        if (!keywordDetection.detected) {
            return {
                isEmergency: false,
                confidence: 0,
                keywords: [],
                requiresImmediateIntervention: false,
                reasoning: 'No emergency keywords detected',
            };
        }

        // Determine emergency type
        const emergencyType = this.classifyEmergencyType(combinedText);

        return {
            isEmergency: keywordDetection.severity === 'critical',
            emergencyType,
            confidence: keywordDetection.severity === 'critical' ? 0.95 : 0.7,
            keywords: keywordDetection.keywords,
            requiresImmediateIntervention: keywordDetection.severity === 'critical',
            reasoning: `Detected ${keywordDetection.severity} emergency keywords: ${keywordDetection.keywords.join(', ')}`,
        };
    }

    private classifyEmergencyType(
        text: string
    ):
        | 'cardiac'
        | 'respiratory'
        | 'neurological'
        | 'trauma'
        | 'mental-health-crisis'
        | 'allergic-reaction'
        | 'other' {
        if (
            text.includes('chest pain') ||
            text.includes('heart attack') ||
            text.includes('crushing')
        ) {
            return 'cardiac';
        }
        if (
            text.includes("can't breathe") ||
            text.includes('choking') ||
            text.includes('blue lips')
        ) {
            return 'respiratory';
        }
        if (
            text.includes('stroke') ||
            text.includes('face drooping') ||
            text.includes('worst headache')
        ) {
            return 'neurological';
        }
        if (
            text.includes('suicidal') ||
            text.includes('kill myself') ||
            text.includes('want to die')
        ) {
            return 'mental-health-crisis';
        }
        if (
            text.includes('anaphylaxis') ||
            text.includes('throat swelling') ||
            text.includes('severe allergic')
        ) {
            return 'allergic-reaction';
        }
        if (
            text.includes('severe bleeding') ||
            text.includes('major trauma') ||
            text.includes('unconscious')
        ) {
            return 'trauma';
        }
        return 'other';
    }

    calculateSeverityScore(params: {
        symptoms: string[];
        duration: string;
        redFlags: string[];
    }): number {
        let score = 0;

        // Base score from symptoms
        score += params.symptoms.length;

        // Red flags significantly increase score
        score += params.redFlags.length * 3;

        // Sudden onset increases score
        if (params.duration.toLowerCase().includes('sudden')) {
            score += 2;
        }

        return Math.min(score, 10);
    }
}
