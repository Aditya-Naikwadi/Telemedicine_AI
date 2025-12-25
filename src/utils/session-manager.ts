import {
    SecureSession,
    SessionValidationResult,
    SessionConfig,
} from '../types/security.types';
import { generateSessionId } from './crypto.utils';

/**
 * Secure session manager for handling user sessions
 */
export class SessionManager {
    private sessions: Map<string, SecureSession> = new Map();
    private config: SessionConfig;

    constructor(config: SessionConfig) {
        this.config = config;
        this.startCleanupInterval();
    }

    /**
     * Create a new secure session
     */
    createSession(
        userId?: string,
        patientId?: string,
        ipAddress?: string,
        userAgent?: string
    ): SecureSession {
        const sessionId = generateSessionId();
        const now = new Date();
        const expiresAt = new Date(
            now.getTime() + this.config.sessionTimeout * 60 * 1000
        );

        const session: SecureSession = {
            sessionId,
            userId,
            patientId,
            createdAt: now,
            lastActivity: now,
            expiresAt,
            ipAddress,
            userAgent,
            isValid: true,
            metadata: {},
        };

        this.sessions.set(sessionId, session);
        return session;
    }

    /**
     * Validate a session
     */
    validateSession(
        sessionId: string,
        ipAddress?: string
    ): SessionValidationResult {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return {
                isValid: false,
                reason: 'Session not found',
            };
        }

        if (!session.isValid) {
            return {
                isValid: false,
                reason: 'Session invalidated',
            };
        }

        const now = new Date();
        if (now > session.expiresAt) {
            this.invalidateSession(sessionId);
            return {
                isValid: false,
                reason: 'Session expired',
            };
        }

        // IP validation if enabled
        if (
            this.config.enforceIPValidation &&
            ipAddress &&
            session.ipAddress &&
            session.ipAddress !== ipAddress
        ) {
            this.invalidateSession(sessionId);
            return {
                isValid: false,
                reason: 'IP address mismatch - possible session hijacking',
            };
        }

        // Update last activity
        session.lastActivity = now;
        this.sessions.set(sessionId, session);

        return {
            isValid: true,
            session,
        };
    }

    /**
     * Refresh session expiration
     */
    refreshSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isValid) {
            return false;
        }

        const now = new Date();
        session.lastActivity = now;
        session.expiresAt = new Date(
            now.getTime() + this.config.sessionTimeout * 60 * 1000
        );

        this.sessions.set(sessionId, session);
        return true;
    }

    /**
     * Invalidate a session
     */
    invalidateSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }

        session.isValid = false;
        this.sessions.set(sessionId, session);
        return true;
    }

    /**
     * Get session by ID
     */
    getSession(sessionId: string): SecureSession | undefined {
        return this.sessions.get(sessionId);
    }

    /**
     * Get all active sessions for a user
     */
    getUserSessions(userId: string): SecureSession[] {
        return Array.from(this.sessions.values()).filter(
            (session) => session.userId === userId && session.isValid
        );
    }

    /**
     * Cleanup expired sessions
     */
    private cleanupExpiredSessions(): void {
        const now = new Date();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.sessions.delete(sessionId);
            }
        }
    }

    /**
     * Start automatic cleanup interval
     */
    private startCleanupInterval(): void {
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000); // Run every 5 minutes
    }

    /**
     * Get session count
     */
    getSessionCount(): number {
        return this.sessions.size;
    }

    /**
     * Clear all sessions
     */
    clearAllSessions(): void {
        this.sessions.clear();
    }
}
