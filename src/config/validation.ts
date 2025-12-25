import { z } from 'zod';
import { TelemedAgentConfig } from '../types';
import { DEFAULT_CONFIG } from './default-config';

const LLMConfigSchema = z.object({
    provider: z.enum(['openai', 'anthropic', 'custom']),
    apiKey: z.string().min(1, 'API key is required'),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().positive().optional(),
    customEndpoint: z.string().url().optional(),
});

const OrganizationConfigSchema = z.object({
    name: z.string().min(1, 'Organization name is required'),
    supportEmail: z.string().email('Valid email required'),
    supportPhone: z.string().optional(),
    website: z.string().url().optional(),
});

const TelemedAgentConfigSchema = z.object({
    llm: LLMConfigSchema,
    organization: OrganizationConfigSchema,
    database: z.any().optional(),
    features: z.any().optional(),
    compliance: z.any().optional(),
    scheduling: z.any().optional(),
    logging: z.any().optional(),
    emergency: z.any().optional(),
});

export function validateConfig(config: unknown): TelemedAgentConfig {
    try {
        return TelemedAgentConfigSchema.parse(config) as TelemedAgentConfig;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(
                (e) => `${e.path.join('.')}: ${e.message}`
            );
            throw new Error(
                `Configuration validation failed:\n${messages.join('\n')}`
            );
        }
        throw error;
    }
}

export function mergeWithDefaults(
    userConfig: Partial<TelemedAgentConfig>
): TelemedAgentConfig {
    return {
        ...DEFAULT_CONFIG,
        ...userConfig,
        llm: { ...DEFAULT_CONFIG.llm, ...userConfig.llm } as any,
        features: { ...DEFAULT_CONFIG.features, ...userConfig.features },
        compliance: { ...DEFAULT_CONFIG.compliance, ...userConfig.compliance },
        scheduling: { ...DEFAULT_CONFIG.scheduling, ...userConfig.scheduling },
        logging: { ...DEFAULT_CONFIG.logging, ...userConfig.logging },
        emergency: { ...DEFAULT_CONFIG.emergency, ...userConfig.emergency },
    } as TelemedAgentConfig;
}
