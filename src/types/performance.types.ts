// Performance and scalability type definitions

export interface PerformanceConfig {
    loadBalancing: LoadBalancerConfig;
    caching: CacheConfig;
    connectionPool: ConnectionPoolConfig;
    circuitBreaker: CircuitBreakerConfig;
    queue: QueueConfig;
    monitoring: MonitoringConfig;
}

// Load Balancer Types
export interface LoadBalancerConfig {
    enabled: boolean;
    strategy: LoadBalancingStrategy;
    healthCheckInterval: number; // milliseconds
    unhealthyThreshold: number;
    healthyThreshold: number;
    instances: AgentInstance[];
}

export type LoadBalancingStrategy =
    | 'round-robin'
    | 'least-connections'
    | 'weighted-round-robin'
    | 'ip-hash'
    | 'health-based';

export interface AgentInstance {
    id: string;
    endpoint?: string;
    weight: number;
    isHealthy: boolean;
    activeConnections: number;
    totalRequests: number;
    lastHealthCheck?: Date;
    metadata?: Record<string, any>;
}

// Cache Types
export interface CacheConfig {
    enabled: boolean;
    type: 'memory' | 'redis' | 'memcached';
    ttl: number; // seconds
    maxSize: number; // MB
    strategy: 'lru' | 'lfu' | 'fifo';
    redisUrl?: string;
    keyPrefix?: string;
}

export interface CacheEntry<T = any> {
    key: string;
    value: T;
    timestamp: Date;
    ttl: number;
    hits: number;
    size: number;
}

// Connection Pool Types
export interface ConnectionPoolConfig {
    enabled: boolean;
    minConnections: number;
    maxConnections: number;
    acquireTimeout: number; // milliseconds
    idleTimeout: number; // milliseconds
    retryAttempts: number;
    retryDelay: number; // milliseconds
}

export interface PooledConnection {
    id: string;
    isActive: boolean;
    createdAt: Date;
    lastUsed: Date;
    requestCount: number;
}

// Circuit Breaker Types
export interface CircuitBreakerConfig {
    enabled: boolean;
    failureThreshold: number;
    successThreshold: number;
    timeout: number; // milliseconds
    resetTimeout: number; // milliseconds
    monitoringPeriod: number; // milliseconds
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStats {
    state: CircuitBreakerState;
    failures: number;
    successes: number;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    lastFailureTime?: Date;
    lastSuccessTime?: Date;
    nextAttemptTime?: Date;
}

// Queue Types
export interface QueueConfig {
    enabled: boolean;
    maxSize: number;
    strategy: 'fifo' | 'lifo' | 'priority';
    timeout: number; // milliseconds
    concurrency: number;
}

export interface QueuedRequest<T = any> {
    id: string;
    data: T;
    priority: number;
    timestamp: Date;
    timeout: number;
    retries: number;
    callback?: (result: any) => void;
}

// Monitoring Types
export interface MonitoringConfig {
    enabled: boolean;
    metricsInterval: number; // milliseconds
    healthCheckEndpoint: boolean;
    detailedMetrics: boolean;
    alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    queueSize: number;
}

export interface HealthMetrics {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    uptime: number; // seconds
    cpu: {
        usage: number; // percentage
        load: number[];
    };
    memory: {
        used: number; // MB
        total: number; // MB
        percentage: number;
    };
    requests: {
        total: number;
        active: number;
        queued: number;
        failed: number;
        averageResponseTime: number;
    };
    cache?: {
        hits: number;
        misses: number;
        hitRate: number;
        size: number;
    };
}

export interface PerformanceMetrics {
    timestamp: Date;
    requestCount: number;
    averageResponseTime: number;
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number; // requests per second
    errorRate: number;
    cacheHitRate?: number;
    activeConnections: number;
}

// Streaming Types
export interface StreamingConfig {
    enabled: boolean;
    chunkSize: number;
    bufferSize: number;
    timeout: number;
}

export interface StreamChunk {
    id: string;
    sequence: number;
    content: string;
    isComplete: boolean;
    metadata?: Record<string, any>;
}

export type StreamCallback = (chunk: StreamChunk) => void;
export type ProgressCallback = (progress: number) => void;

// Request Types
export interface EnhancedChatRequest {
    message: string;
    sessionId: string;
    patientId?: string;
    conversationHistory?: any[];
    streaming?: boolean;
    onStream?: StreamCallback;
    onProgress?: ProgressCallback;
    priority?: number;
    timeout?: number;
}

export interface EnhancedChatResponse {
    message: string;
    sessionId: string;
    metadata?: {
        intent?: string;
        urgencyLevel?: 'routine' | 'urgent' | 'emergency';
        emergencyDetected?: boolean;
        emergencyType?: string;
        emergencyInstructions?: string;
        appointmentBooked?: boolean;
        responseTime?: number;
        cached?: boolean;
        streamId?: string;
        [key: string]: any;
    };
}
