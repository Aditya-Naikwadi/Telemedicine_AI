import { AssessSymptomsParams, AssessmentResult } from '../types';
import { SYMPTOMS_DATABASE, MEDICAL_SPECIALTIES } from '../data';

export class SymptomAssessmentService {
    async assessSymptoms(
        params: AssessSymptomsParams
    ): Promise<AssessmentResult> {
        // Check for emergency keywords
        const emergencyDetected = this.checkForEmergency(params);

        if (emergencyDetected) {
            return {
                urgencyLevel: 'emergency',
                severity: 10,
                recommendedSpecialty: 'emergency-medicine',
                reasoning: 'Emergency symptoms detected requiring immediate care',
                nextSteps: 'Call 911 or go to emergency room immediately',
                requiresImmediateEscalation: true,
            };
        }

        // Match symptoms to specialty
        const specialtyMatch = this.matchSymptomToSpecialty(
            params.primarySymptom,
            params.associatedSymptoms || []
        );

        // Calculate severity score
        const severityScore = this.calculateSeverityScore(params);

        // Determine urgency
        const urgencyLevel = this.determineUrgency(
            severityScore,
            params.redFlagSymptoms || []
        );

        return {
            urgencyLevel,
            severity: severityScore,
            recommendedSpecialty: specialtyMatch.primary,
            alternativeSpecialties: specialtyMatch.alternatives,
            reasoning: this.generateReasoning(params, specialtyMatch),
            nextSteps: this.generateNextSteps(urgencyLevel),
            estimatedWaitTime: this.getEstimatedWaitTime(urgencyLevel),
            requiresImmediateEscalation: false,
        };
    }

    private checkForEmergency(params: AssessSymptomsParams): boolean {
        const redFlags = params.redFlagSymptoms || [];
        const criticalKeywords = [
            'crushing',
            'radiating',
            "can't breathe",
            'blue lips',
            'worst headache',
            'suicidal',
        ];

        return redFlags.some((flag) =>
            criticalKeywords.some((keyword) =>
                flag.toLowerCase().includes(keyword)
            )
        );
    }

    matchSymptomToSpecialty(
        primarySymptom: string,
        associatedSymptoms: string[]
    ): {
        primary: string;
        alternatives: string[];
        confidence: number;
    } {
        const allSymptoms = [primarySymptom, ...associatedSymptoms];
        const lowerSymptoms = allSymptoms.map((s) => s.toLowerCase());

        // Find matching specialties
        const matches = MEDICAL_SPECIALTIES.map((specialty) => {
            const matchCount = specialty.associatedSymptoms.filter((symptom) =>
                lowerSymptoms.some((s) => s.includes(symptom.toLowerCase()))
            ).length;

            const keywordMatch = specialty.keywords.some((keyword) =>
                lowerSymptoms.some((s) => s.includes(keyword.toLowerCase()))
            );

            const score = matchCount + (keywordMatch ? 2 : 0);

            return {
                specialty: specialty.id,
                score,
            };
        }).sort((a, b) => b.score - a.score);

        const topMatch = matches[0];
        const alternatives = matches
            .slice(1, 3)
            .filter((m) => m.score > 0)
            .map((m) => m.specialty);

        return {
            primary: topMatch.specialty || 'general-practice',
            alternatives,
            confidence: topMatch.score > 0 ? 0.8 : 0.5,
        };
    }

    private calculateSeverityScore(params: AssessSymptomsParams): number {
        let score = params.symptomDetails.severity || 5;

        // Adjust for red flags
        if (params.redFlagSymptoms && params.redFlagSymptoms.length > 0) {
            score += params.redFlagSymptoms.length * 2;
        }

        // Adjust for associated symptoms
        if (params.associatedSymptoms && params.associatedSymptoms.length > 2) {
            score += 1;
        }

        // Adjust for onset
        if (params.symptomDetails.onset.toLowerCase().includes('sudden')) {
            score += 2;
        }

        return Math.min(score, 10);
    }

    private determineUrgency(
        severityScore: number,
        redFlags: string[]
    ): 'routine' | 'urgent' | 'emergency' {
        if (severityScore >= 9 || redFlags.length >= 3) {
            return 'emergency';
        }
        if (severityScore >= 6 || redFlags.length >= 1) {
            return 'urgent';
        }
        return 'routine';
    }

    private generateReasoning(
        params: AssessSymptomsParams,
        match: { primary: string; alternatives: string[] }
    ): string {
        const specialty = MEDICAL_SPECIALTIES.find((s) => s.id === match.primary);
        return `Based on your ${params.primarySymptom} and associated symptoms, I recommend consulting with ${specialty?.name || 'a healthcare provider'}.`;
    }

    private generateNextSteps(
        urgencyLevel: 'routine' | 'urgent' | 'emergency'
    ): string {
        switch (urgencyLevel) {
            case 'emergency':
                return 'Seek immediate emergency care by calling 911 or going to the nearest emergency room.';
            case 'urgent':
                return 'Schedule an appointment within the next 24-48 hours or visit an urgent care center.';
            case 'routine':
                return 'Schedule a routine appointment with the recommended specialist.';
        }
    }

    private getEstimatedWaitTime(
        urgencyLevel: 'routine' | 'urgent' | 'emergency'
    ): string {
        switch (urgencyLevel) {
            case 'emergency':
                return 'Immediate';
            case 'urgent':
                return '1-2 days';
            case 'routine':
                return '1-2 weeks';
        }
    }
}
