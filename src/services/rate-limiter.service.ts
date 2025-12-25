import {
    RateLimitConfig,
    RateLimitEntry,
    RateLimitResult,
} from '../types/security.types';

/**
 * Rate limiting service to prevent abuse and DoS attacks
 */
export class RateLimiterService {
    private entries: Map<string, RateLimitEntry> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
        this.startCleanupInterval();
    }

    /**
     * Check if request is allowed
     */
    checkRateLimit(
        sessionId: string,
        ipAddress?: string
    ): RateLimitResult {
        if (!this.config.enabled) {
            return {
                allowed: true,
                remaining: this.config.maxRequestsPerMinute,
                resetAt: new Date(Date.now() + 60000),
            };
        }

        // Check whitelist
        if (this.config.whitelistedSessions.includes(sessionId)) {
            return {
                allowed: true,
                remaining: Infinity,
                resetAt: new Date(Date.now() + 60000),
            };
        }

        const key = this.getKey(sessionId, ipAddress);
        const now = new Date();
        let entry = this.entries.get(key);

        // Check if blocked
        if (entry?.isBlocked && entry.blockedUntil && now < entry.blockedUntil) {
            const retryAfter = Math.ceil(
                (entry.blockedUntil.getTime() - now.getTime()) / 1000
            );
            return {
                allowed: false,
                remaining: 0,
                resetAt: entry.blockedUntil,
                retryAfter,
            };
        }

        // Create new entry if doesn't exist or window expired
        if (!entry || this.isWindowExpired(entry.windowStart)) {
            entry = {
                sessionId,
                ipAddress,
                requestCount: 1,
                windowStart: now,
                isBlocked: false,
            };
            this.entries.set(key, entry);

            return {
                allowed: true,
                remaining: this.config.maxRequestsPerMinute - 1,
                resetAt: new Date(now.getTime() + 60000),
            };
        }

        // Increment request count
        entry.requestCount++;

        // Check if limit exceeded
        if (entry.requestCount > this.config.maxRequestsPerMinute) {
            entry.isBlocked = true;
            entry.blockedUntil = new Date(
                now.getTime() + this.config.blockDurationMinutes * 60000
            );
            this.entries.set(key, entry);

            return {
                allowed: false,
                remaining: 0,
                resetAt: entry.blockedUntil,
                retryAfter: this.config.blockDurationMinutes * 60,
            };
        }

        this.entries.set(key, entry);

        return {
            allowed: true,
            remaining: this.config.maxRequestsPerMinute - entry.requestCount,
            resetAt: new Date(entry.windowStart.getTime() + 60000),
        };
    }

    /**
     * Reset rate limit for a session
     */
    resetRateLimit(sessionId: string, ipAddress?: string): void {
        const key = this.getKey(sessionId, ipAddress);
        this.entries.delete(key);
    }

    /**
     * Block a session
     */
    blockSession(sessionId: string, ipAddress?: string): void {
        const key = this.getKey(sessionId, ipAddress);
        const now = new Date();

        const entry: RateLimitEntry = {
            sessionId,
            ipAddress,
            requestCount: this.config.maxRequestsPerMinute + 1,
            windowStart: now,
            isBlocked: true,
            blockedUntil: new Date(
                now.getTime() + this.config.blockDurationMinutes * 60000
            ),
        };

        this.entries.set(key, entry);
    }

    /**
     * Unblock a session
     */
    unblockSession(sessionId: string, ipAddress?: string): void {
        const key = this.getKey(sessionId, ipAddress);
        const entry = this.entries.get(key);

        if (entry) {
            entry.isBlocked = false;
            entry.blockedUntil = undefined;
            this.entries.set(key, entry);
        }
    }

    /**
     * Get rate limit entry
     */
    getEntry(sessionId: string, ipAddress?: string): RateLimitEntry | undefined {
        const key = this.getKey(sessionId, ipAddress);
        return this.entries.get(key);
    }

    /**
     * Generate key for entry
     */
    private getKey(sessionId: string, ipAddress?: string): string {
        return ipAddress ? `${sessionId}:${ipAddress}` : sessionId;
    }

    /**
     * Check if window has expired
     */
    private isWindowExpired(windowStart: Date): boolean {
        const now = new Date();
        const elapsed = now.getTime() - windowStart.getTime();
        return elapsed > 60000; // 1 minute window
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = new Date();

        for (const [key, entry] of this.entries.entries()) {
            // Remove if window expired and not blocked
            if (this.isWindowExpired(entry.windowStart) && !entry.isBlocked) {
                this.entries.delete(key);
            }

            // Remove if block expired
            if (
                entry.isBlocked &&
                entry.blockedUntil &&
                now > entry.blockedUntil
            ) {
                this.entries.delete(key);
            }
        }
    }

    /**
     * Start automatic cleanup interval
     */
    private startCleanupInterval(): void {
        setInterval(() => {
            this.cleanup();
        }, 60000); // Run every minute
    }

    /**
     * Get statistics
     */
    getStats(): {
        totalEntries: number;
        blockedSessions: number;
        activeRequests: number;
    } {
        let blockedSessions = 0;
        let activeRequests = 0;

        for (const entry of this.entries.values()) {
            if (entry.isBlocked) {
                blockedSessions++;
            }
            activeRequests += entry.requestCount;
        }

        return {
            totalEntries: this.entries.size,
            blockedSessions,
            activeRequests,
        };
    }
}
