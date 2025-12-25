import {
    CircuitBreakerConfig,
    CircuitBreakerState,
    CircuitBreakerStats,
} from '../types/performance.types';

/**
 * Circuit breaker pattern implementation
 * Prevents cascading failures and provides automatic recovery
 */
export class CircuitBreakerService {
    private config: CircuitBreakerConfig;
    private state: CircuitBreakerState = 'CLOSED';
    private failures: number = 0;
    private successes: number = 0;
    private consecutiveFailures: number = 0;
    private consecutiveSuccesses: number = 0;
    private lastFailureTime?: Date;
    private lastSuccessTime?: Date;
    private nextAttemptTime?: Date;

    constructor(config: CircuitBreakerConfig) {
        this.config = config;
    }

    /**
     * Execute function with circuit breaker protection
     */
    async execute<T>(
        fn: () => Promise<T>,
        fallback?: () => Promise<T>
    ): Promise<T> {
        if (!this.config.enabled) {
            return fn();
        }

        // Check if circuit is open
        if (this.state === 'OPEN') {
            const now = new Date();

            // Check if we should try again
            if (this.nextAttemptTime && now >= this.nextAttemptTime) {
                this.state = 'HALF_OPEN';
                this.consecutiveSuccesses = 0;
            } else {
                // Circuit is still open, use fallback or throw
                if (fallback) {
                    return fallback();
                }
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await this.executeWithTimeout(fn);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();

            // Use fallback if available
            if (fallback) {
                try {
                    return await fallback();
                } catch (fallbackError) {
                    throw error; // Throw original error
                }
            }

            throw error;
        }
    }

    /**
     * Execute function with timeout
     */
    private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
        return Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
                setTimeout(
                    () => reject(new Error('Circuit breaker timeout')),
                    this.config.timeout
                )
            ),
        ]);
    }

    /**
     * Handle successful execution
     */
    private onSuccess(): void {
        this.successes++;
        this.consecutiveSuccesses++;
        this.consecutiveFailures = 0;
        this.lastSuccessTime = new Date();

        if (this.state === 'HALF_OPEN') {
            // Check if we should close the circuit
            if (this.consecutiveSuccesses >= this.config.successThreshold) {
                this.state = 'CLOSED';
                this.failures = 0;
                this.consecutiveFailures = 0;
            }
        }
    }

    /**
     * Handle failed execution
     */
    private onFailure(): void {
        this.failures++;
        this.consecutiveFailures++;
        this.consecutiveSuccesses = 0;
        this.lastFailureTime = new Date();

        if (this.state === 'HALF_OPEN') {
            // Go back to open state
            this.state = 'OPEN';
            this.nextAttemptTime = new Date(
                Date.now() + this.config.resetTimeout
            );
        } else if (this.state === 'CLOSED') {
            // Check if we should open the circuit
            if (this.consecutiveFailures >= this.config.failureThreshold) {
                this.state = 'OPEN';
                this.nextAttemptTime = new Date(
                    Date.now() + this.config.resetTimeout
                );
            }
        }
    }

    /**
     * Get current circuit breaker statistics
     */
    getStats(): CircuitBreakerStats {
        return {
            state: this.state,
            failures: this.failures,
            successes: this.successes,
            consecutiveFailures: this.consecutiveFailures,
            consecutiveSuccesses: this.consecutiveSuccesses,
            lastFailureTime: this.lastFailureTime,
            lastSuccessTime: this.lastSuccessTime,
            nextAttemptTime: this.nextAttemptTime,
        };
    }

    /**
     * Get current state
     */
    getState(): CircuitBreakerState {
        return this.state;
    }

    /**
     * Reset circuit breaker
     */
    reset(): void {
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses = 0;
        this.lastFailureTime = undefined;
        this.lastSuccessTime = undefined;
        this.nextAttemptTime = undefined;
    }

    /**
     * Force open the circuit
     */
    forceOpen(): void {
        this.state = 'OPEN';
        this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
    }

    /**
     * Force close the circuit
     */
    forceClose(): void {
        this.state = 'CLOSED';
        this.consecutiveFailures = 0;
        this.nextAttemptTime = undefined;
    }
}
