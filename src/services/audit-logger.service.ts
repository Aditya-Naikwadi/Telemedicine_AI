import {
    AuditLog,
    AuditEventType,
    AuditLogConfig,
} from '../types/security.types';
import { v4 as uuidv4 } from 'uuid';
import { EncryptionService } from './encryption.service';

/**
 * HIPAA-compliant audit logging service
 */
export class AuditLoggerService {
    private logs: AuditLog[] = [];
    private config: AuditLogConfig;
    private encryptionService?: EncryptionService;

    constructor(config: AuditLogConfig, encryptionService?: EncryptionService) {
        this.config = config;
        this.encryptionService = encryptionService;
    }

    /**
     * Log an audit event
     */
    log(
        eventType: AuditEventType,
        action: string,
        sessionId: string,
        options: {
            severity?: 'low' | 'medium' | 'high' | 'critical';
            userId?: string;
            ipAddress?: string;
            resource?: string;
            outcome?: 'success' | 'failure' | 'blocked';
            metadata?: Record<string, any>;
            phiAccessed?: boolean;
        } = {}
    ): void {
        if (!this.config.enabled) {
            return;
        }

        // Check if we should log this event type
        if (eventType === 'phi-access' && !this.config.logPHIAccess) {
            return;
        }

        if (
            (eventType === 'authentication' || eventType === 'authorization') &&
            !this.config.logAuthEvents
        ) {
            return;
        }

        if (eventType === 'security-event' && !this.config.logSecurityEvents) {
            return;
        }

        const auditLog: AuditLog = {
            id: uuidv4(),
            timestamp: new Date(),
            eventType,
            severity: options.severity || 'low',
            userId: options.userId,
            sessionId,
            ipAddress: options.ipAddress,
            action,
            resource: options.resource,
            outcome: options.outcome || 'success',
            metadata: options.metadata,
            phiAccessed: options.phiAccessed || false,
        };

        this.logs.push(auditLog);

        // Log to console if configured
        if (this.config.logLevel === 'detailed') {
            console.log('[AUDIT]', JSON.stringify(auditLog, null, 2));
        } else if (this.config.logLevel === 'standard') {
            console.log(
                `[AUDIT] ${auditLog.eventType} - ${auditLog.action} - ${auditLog.outcome}`
            );
        }

        // Cleanup old logs
        this.cleanupOldLogs();
    }

    /**
     * Log PHI access
     */
    logPHIAccess(
        sessionId: string,
        userId: string,
        resource: string,
        action: string,
        ipAddress?: string
    ): void {
        this.log('phi-access', action, sessionId, {
            severity: 'high',
            userId,
            resource,
            ipAddress,
            phiAccessed: true,
            outcome: 'success',
        });
    }

    /**
     * Log security event
     */
    logSecurityEvent(
        sessionId: string,
        action: string,
        severity: 'low' | 'medium' | 'high' | 'critical',
        metadata?: Record<string, any>
    ): void {
        this.log('security-event', action, sessionId, {
            severity,
            metadata,
            outcome: 'blocked',
        });
    }

    /**
     * Log authentication event
     */
    logAuthentication(
        sessionId: string,
        userId: string,
        outcome: 'success' | 'failure',
        ipAddress?: string
    ): void {
        this.log('authentication', 'User login attempt', sessionId, {
            severity: outcome === 'failure' ? 'medium' : 'low',
            userId,
            ipAddress,
            outcome,
        });
    }

    /**
     * Log data access
     */
    logDataAccess(
        sessionId: string,
        userId: string,
        resource: string,
        action: string,
        phiAccessed: boolean = false
    ): void {
        this.log('data-access', action, sessionId, {
            severity: phiAccessed ? 'high' : 'low',
            userId,
            resource,
            phiAccessed,
            outcome: 'success',
        });
    }

    /**
     * Get audit logs
     */
    getLogs(filter?: {
        eventType?: AuditEventType;
        sessionId?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): AuditLog[] {
        let filteredLogs = [...this.logs];

        if (filter) {
            if (filter.eventType) {
                filteredLogs = filteredLogs.filter(
                    (log) => log.eventType === filter.eventType
                );
            }

            if (filter.sessionId) {
                filteredLogs = filteredLogs.filter(
                    (log) => log.sessionId === filter.sessionId
                );
            }

            if (filter.userId) {
                filteredLogs = filteredLogs.filter(
                    (log) => log.userId === filter.userId
                );
            }

            if (filter.startDate) {
                filteredLogs = filteredLogs.filter(
                    (log) => log.timestamp >= filter.startDate!
                );
            }

            if (filter.endDate) {
                filteredLogs = filteredLogs.filter(
                    (log) => log.timestamp <= filter.endDate!
                );
            }
        }

        return filteredLogs;
    }

    /**
     * Export audit logs (for compliance reporting)
     */
    exportLogs(format: 'json' | 'csv' = 'json'): string {
        if (format === 'json') {
            return JSON.stringify(this.logs, null, 2);
        }

        // CSV format
        const headers = [
            'ID',
            'Timestamp',
            'Event Type',
            'Severity',
            'User ID',
            'Session ID',
            'Action',
            'Outcome',
            'PHI Accessed',
        ];

        const rows = this.logs.map((log) => [
            log.id,
            log.timestamp.toISOString(),
            log.eventType,
            log.severity,
            log.userId || '',
            log.sessionId,
            log.action,
            log.outcome,
            log.phiAccessed ? 'Yes' : 'No',
        ]);

        return [headers.join(','), ...rows.map((row) => row.join(','))].join(
            '\n'
        );
    }

    /**
     * Cleanup old logs based on retention policy
     */
    private cleanupOldLogs(): void {
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - this.config.retentionDays);

        this.logs = this.logs.filter((log) => log.timestamp >= retentionDate);
    }

    /**
     * Get log count
     */
    getLogCount(): number {
        return this.logs.length;
    }

    /**
     * Clear all logs (use with caution)
     */
    clearLogs(): void {
        this.logs = [];
    }
}
