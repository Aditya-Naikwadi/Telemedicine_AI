import OpenAI from 'openai';
import {
    TelemedAgentConfig,
    ChatRequest,
    ChatResponse,
    ChatMessage,
} from './types';
import { validateConfig, mergeWithDefaults } from './config';
import { generateSystemPrompt, TOOL_DEFINITIONS } from './core';
import {
    SymptomAssessmentService,
    EmergencyDetectionService,
    SecurityValidatorService,
    EncryptionService,
    AuditLoggerService,
    RateLimiterService,
    PIIDetectorService,
    CacheService,
    CircuitBreakerService,
    LoadBalancerService,
    QueueService,
    HealthMonitorService,
} from './services';
import { createLogger, SessionManager } from './utils';

export class TelemedAgent {
    private config: TelemedAgentConfig;
    private openai: OpenAI;
    private systemPrompt: string;
    private symptomService: SymptomAssessmentService;
    private emergencyService: EmergencyDetectionService;
    private logger: any;
    private sessions: Map<string, ChatMessage[]>;

    // Security services
    private securityValidator: SecurityValidatorService;
    private encryptionService?: EncryptionService;
    private auditLogger: AuditLoggerService;
    private rateLimiter: RateLimiterService;
    private piiDetector: PIIDetectorService;
    private sessionManager: SessionManager;

    // Performance services
    private cacheService: CacheService;
    private circuitBreaker: CircuitBreakerService;
    private loadBalancer?: LoadBalancerService;
    private queueService: QueueService;
    private healthMonitor: HealthMonitorService;

    constructor(config: Partial<TelemedAgentConfig>) {
        // Validate and merge config
        const mergedConfig = mergeWithDefaults(config);
        this.config = validateConfig(mergedConfig);

        // Initialize OpenAI
        if (this.config.llm.provider === 'openai') {
            this.openai = new OpenAI({
                apiKey: this.config.llm.apiKey,
            });
        } else {
            throw new Error(
                `LLM provider ${this.config.llm.provider} not yet implemented`
            );
        }

        // Generate system prompt
        this.systemPrompt = generateSystemPrompt(this.config);

        // Initialize services
        this.symptomService = new SymptomAssessmentService();
        this.emergencyService = new EmergencyDetectionService();

        // Initialize security services
        this.securityValidator = new SecurityValidatorService();
        this.auditLogger = new AuditLoggerService(
            this.config.security?.auditLogging || {
                enabled: true,
                logLevel: 'standard',
                retentionDays: 2555,
                logPHIAccess: true,
                logAuthEvents: true,
                logSecurityEvents: true,
                encryptLogs: false,
            }
        );
        this.rateLimiter = new RateLimiterService(
            this.config.security?.rateLimiting || {
                enabled: true,
                maxRequestsPerMinute: 60,
                maxRequestsPerHour: 1000,
                blockDurationMinutes: 15,
                whitelistedSessions: [],
            }
        );
        this.piiDetector = new PIIDetectorService(
            this.config.security?.piiProtection || {
                enabled: true,
                autoDetect: true,
                maskInLogs: true,
                maskInResponses: false,
                piiTypes: ['ssn', 'email', 'phone', 'dob', 'mrn', 'credit-card'],
            }
        );
        this.sessionManager = new SessionManager(
            this.config.security?.sessionManagement || {
                sessionTimeout: 30,
                requireTokenValidation: true,
                maxConcurrentSessions: 5,
                enforceIPValidation: false,
            }
        );

        // Initialize encryption if enabled
        if (this.config.security?.encryption?.enabled) {
            this.encryptionService = new EncryptionService(
                this.config.security.encryption
            );
        }

        // Initialize performance services
        this.cacheService = new CacheService(
            this.config.performance?.caching || {
                enabled: true,
                type: 'memory',
                ttl: 3600,
                maxSize: 100,
                strategy: 'lru',
                keyPrefix: 'telemed',
            }
        );
        this.circuitBreaker = new CircuitBreakerService(
            this.config.performance?.circuitBreaker || {
                enabled: true,
                failureThreshold: 5,
                successThreshold: 2,
                timeout: 30000,
                resetTimeout: 60000,
                monitoringPeriod: 10000,
            }
        );
        this.queueService = new QueueService(
            this.config.performance?.queue || {
                enabled: true,
                maxSize: 1000,
                strategy: 'priority',
                timeout: 60000,
                concurrency: 10,
            }
        );
        this.healthMonitor = new HealthMonitorService(
            this.config.performance?.monitoring || {
                enabled: true,
                metricsInterval: 60000,
                healthCheckEndpoint: true,
                detailedMetrics: false,
                alertThresholds: {
                    cpuUsage: 80,
                    memoryUsage: 85,
                    responseTime: 5000,
                    errorRate: 5,
                    queueSize: 800,
                },
            }
        );

        // Initialize load balancer if enabled
        if (this.config.performance?.loadBalancing?.enabled) {
            this.loadBalancer = new LoadBalancerService(
                this.config.performance.loadBalancing
            );
        }

        // Initialize logger
        this.logger = createLogger(this.config.logging);

        // Initialize session storage
        this.sessions = new Map();

        this.logger.info('TelemedAgent initialized', {
            organization: this.config.organization.name,
        });

        // Log initialization
        this.auditLogger.log(
            'configuration-change',
            'TelemedAgent initialized',
            'system',
            {
                severity: 'low',
                outcome: 'success',
            }
        );
    }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        try {
            // 1. Validate session
            const sessionValidation = this.sessionManager.validateSession(
                request.sessionId
            );
            if (!sessionValidation.isValid) {
                this.auditLogger.logSecurityEvent(
                    request.sessionId,
                    'Invalid session attempt',
                    'high',
                    { reason: sessionValidation.reason }
                );
                throw new Error(`Session validation failed: ${sessionValidation.reason}`);
            }

            // 2. Check rate limiting
            const rateLimitCheck = this.rateLimiter.checkRateLimit(
                request.sessionId
            );
            if (!rateLimitCheck.allowed) {
                this.auditLogger.log(
                    'rate-limit-exceeded',
                    'Request blocked due to rate limit',
                    request.sessionId,
                    {
                        severity: 'medium',
                        outcome: 'blocked',
                    }
                );
                throw new Error(
                    `Rate limit exceeded. Please try again in ${rateLimitCheck.retryAfter} seconds.`
                );
            }

            // 3. Validate and sanitize input
            const validationResult = SecurityValidatorService.validateSessionData({
                sessionId: request.sessionId,
                message: request.message,
            });

            if (!validationResult.isValid) {
                this.auditLogger.log(
                    'validation-failure',
                    'Input validation failed',
                    request.sessionId,
                    {
                        severity: 'medium',
                        outcome: 'blocked',
                        metadata: { errors: validationResult.errors },
                    }
                );
                throw new Error(
                    `Input validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`
                );
            }

            // 4. Check for injection attempts
            const injectionCheck = SecurityValidatorService.validateAgainstInjection(
                request.message
            );
            if (!injectionCheck.isValid) {
                this.auditLogger.logSecurityEvent(
                    request.sessionId,
                    'Injection attempt detected',
                    'critical',
                    { threats: injectionCheck.threats }
                );
                throw new Error('Security violation detected in input');
            }

            // 5. Detect and mask PII in logs
            const piiDetection = this.piiDetector.detectPII(request.message);
            const sanitizedMessage = validationResult.sanitizedData?.message || request.message;

            // Log the request (with PII masked)
            this.auditLogger.logDataAccess(
                request.sessionId,
                request.patientId || 'anonymous',
                'chat',
                'User message received',
                piiDetection.hasPII
            );

            // Get or create session
            let conversationHistory = this.sessions.get(request.sessionId) || [];

            // Add user message
            const userMessage: ChatMessage = {
                role: 'user',
                content: sanitizedMessage,
                timestamp: new Date(),
            };
            conversationHistory.push(userMessage);

            // Check for emergency keywords first
            const emergencyCheck = this.emergencyService.detectEmergency([
                sanitizedMessage,
            ]);

            if (emergencyCheck.isEmergency) {
                // Log emergency detection
                this.auditLogger.log(
                    'emergency-event',
                    'Emergency situation detected',
                    request.sessionId,
                    {
                        severity: 'critical',
                        outcome: 'success',
                        metadata: {
                            emergencyType: emergencyCheck.emergencyType,
                            keywords: emergencyCheck.keywords,
                        },
                    }
                );

                const emergencyResponse = this.handleEmergency(emergencyCheck);
                conversationHistory.push({
                    role: 'assistant',
                    content: emergencyResponse.message,
                    timestamp: new Date(),
                });
                this.sessions.set(request.sessionId, conversationHistory);
                return emergencyResponse;
            }

            // Build messages for OpenAI
            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
                {
                    role: 'system',
                    content: this.systemPrompt,
                },
                ...conversationHistory.map((msg) => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                })),
            ];

            // Call OpenAI
            const completion = await this.openai.chat.completions.create({
                model: this.config.llm.model || 'gpt-4-turbo-preview',
                messages,
                tools: TOOL_DEFINITIONS as any,
                temperature: this.config.llm.temperature || 0.7,
                max_tokens: this.config.llm.maxTokens || 1000,
            });
            const assistantMessage = completion.choices[0].message;

            // Handle tool calls
            if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                const toolResults = await this.handleToolCalls(
                    assistantMessage.tool_calls
                );

                // Add tool results to conversation and get final response
                const finalCompletion = await this.openai.chat.completions.create({
                    model: this.config.llm.model || 'gpt-4-turbo-preview',
                    messages: [
                        ...messages,
                        assistantMessage,
                        ...toolResults.map((result) => ({
                            role: 'tool' as const,
                            tool_call_id: result.tool_call_id,
                            content: JSON.stringify(result.content),
                        })),
                    ],
                    temperature: this.config.llm.temperature || 0.7,
                    max_tokens: this.config.llm.maxTokens || 1000,
                });

                const finalMessage = finalCompletion.choices[0].message.content || '';

                conversationHistory.push({
                    role: 'assistant',
                    content: finalMessage,
                    timestamp: new Date(),
                });

                this.sessions.set(request.sessionId, conversationHistory);

                return {
                    message: finalMessage,
                    sessionId: request.sessionId,
                    metadata: {
                        intent: 'general',
                    },
                };
            }

            // No tool calls, return direct response
            const responseContent = assistantMessage.content || '';

            conversationHistory.push({
                role: 'assistant',
                content: responseContent,
                timestamp: new Date(),
            });

            this.sessions.set(request.sessionId, conversationHistory);

            return {
                message: responseContent,
                sessionId: request.sessionId,
                metadata: {
                    intent: 'general',
                },
            };
        } catch (error) {
            this.logger.error('Chat error', { error });
            throw error;
        }
    }

    private async handleToolCalls(
        toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[]
    ): Promise<Array<{ tool_call_id: string; content: any }>> {
        const results = [];

        for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);

            let result;

            switch (functionName) {
                case 'assessSymptoms':
                    result = await this.symptomService.assessSymptoms(args);
                    break;

                case 'recommendSpecialty':
                    result = this.symptomService.matchSymptomToSpecialty(
                        args.primaryConcern,
                        args.symptoms || []
                    );
                    break;

                case 'escalateToEmergency':
                    result = {
                        emergencyNumber: this.config.emergency?.emergencyNumber || '911',
                        hospitalEmergencyLine:
                            this.config.emergency?.hospitalEmergencyLine,
                        instructions: 'Call 911 or go to nearest emergency room immediately',
                    };
                    break;

                default:
                    result = { error: `Unknown tool: ${functionName}` };
            }

            results.push({
                tool_call_id: toolCall.id,
                content: result,
            });
        }

        return results;
    }

    private handleEmergency(emergencyCheck: any): ChatResponse {
        const emergencyNumber = this.config.emergency?.emergencyNumber || '911';
        const hospitalLine = this.config.emergency?.hospitalEmergencyLine;

        const message = `⚠️ EMERGENCY ALERT ⚠️

Based on what you've described, this requires immediate medical attention.

PLEASE DO ONE OF THE FOLLOWING IMMEDIATELY:
1. Call ${emergencyNumber} (Emergency Services)
${hospitalLine ? `2. Call ${hospitalLine} (Hospital Emergency Line)` : ''}
${hospitalLine ? '3' : '2'}. Go to the nearest emergency room

Do NOT wait for an appointment. This cannot be handled through telemedicine.

Emergency type detected: ${emergencyCheck.emergencyType}
Keywords: ${emergencyCheck.keywords.join(', ')}

Are you able to get emergency help right now?`;

        return {
            message,
            sessionId: 'emergency',
            metadata: {
                emergencyDetected: true,
                emergencyType: emergencyCheck.emergencyType,
                emergencyInstructions: message,
                urgencyLevel: 'emergency',
            },
        };
    }

    getWelcomeMessage(): string {
        return `Welcome to ${this.config.organization.name}! I'm your virtual healthcare assistant, here to help you navigate your healthcare needs.

I can help you with:
- Assessing symptoms and recommending specialists
- Scheduling appointments
- Answering questions about our services
- Providing general health information

To get started, could you tell me what brings you here today?

Please note: I provide educational information and support, but I cannot diagnose conditions or prescribe treatments. Always consult with a licensed healthcare provider for medical advice specific to your situation.`;
    }

    getConfig(): TelemedAgentConfig {
        return { ...this.config };
    }
}

export function createTelemedAgent(
    config: Partial<TelemedAgentConfig>
): TelemedAgent {
    return new TelemedAgent(config);
}
