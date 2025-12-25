import {
    MonitoringConfig,
    HealthMetrics,
    PerformanceMetrics,
} from '../types/performance.types';
import * as os from 'os';

/**
 * Health monitoring service for tracking system metrics
 */
export class HealthMonitorService {
    private config: MonitoringConfig;
    private startTime: Date = new Date();
    private requestMetrics: {
        total: number;
        active: number;
        queued: number;
        failed: number;
        responseTimes: number[];
    } = {
            total: 0,
            active: 0,
            queued: 0,
            failed: 0,
            responseTimes: [],
        };

    constructor(config: MonitoringConfig) {
        this.config = config;
        if (this.config.enabled) {
            this.startMetricsCollection();
        }
    }

    /**
     * Record request start
     */
    recordRequestStart(): string {
        this.requestMetrics.total++;
        this.requestMetrics.active++;
        return Date.now().toString();
    }

    /**
     * Record request end
     */
    recordRequestEnd(requestId: string, success: boolean = true): void {
        this.requestMetrics.active--;

        if (!success) {
            this.requestMetrics.failed++;
        }

        const responseTime = Date.now() - parseInt(requestId);
        this.requestMetrics.responseTimes.push(responseTime);

        // Keep only last 1000 response times
        if (this.requestMetrics.responseTimes.length > 1000) {
            this.requestMetrics.responseTimes.shift();
        }
    }

    /**
     * Record queued request
     */
    recordQueued(count: number): void {
        this.requestMetrics.queued = count;
    }

    /**
     * Get current health metrics
     */
    getHealthMetrics(): HealthMetrics {
        const uptime = (Date.now() - this.startTime.getTime()) / 1000;
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        const avgResponseTime = this.calculateAverage(
            this.requestMetrics.responseTimes
        );

        // Determine health status
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        if (
            avgResponseTime > this.config.alertThresholds.responseTime ||
            this.requestMetrics.queued > this.config.alertThresholds.queueSize
        ) {
            status = 'degraded';
        }

        const errorRate =
            this.requestMetrics.total > 0
                ? (this.requestMetrics.failed / this.requestMetrics.total) * 100
                : 0;

        if (errorRate > this.config.alertThresholds.errorRate) {
            status = 'unhealthy';
        }

        return {
            status,
            timestamp: new Date(),
            uptime,
            cpu: {
                usage: this.getCPUUsage(),
                load: os.loadavg(),
            },
            memory: {
                used: usedMem / (1024 * 1024), // MB
                total: totalMem / (1024 * 1024), // MB
                percentage: (usedMem / totalMem) * 100,
            },
            requests: {
                total: this.requestMetrics.total,
                active: this.requestMetrics.active,
                queued: this.requestMetrics.queued,
                failed: this.requestMetrics.failed,
                averageResponseTime: avgResponseTime,
            },
        };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics {
        const responseTimes = [...this.requestMetrics.responseTimes].sort(
            (a, b) => a - b
        );

        return {
            timestamp: new Date(),
            requestCount: this.requestMetrics.total,
            averageResponseTime: this.calculateAverage(responseTimes),
            p50ResponseTime: this.calculatePercentile(responseTimes, 50),
            p95ResponseTime: this.calculatePercentile(responseTimes, 95),
            p99ResponseTime: this.calculatePercentile(responseTimes, 99),
            throughput: this.calculateThroughput(),
            errorRate:
                this.requestMetrics.total > 0
                    ? (this.requestMetrics.failed / this.requestMetrics.total) *
                    100
                    : 0,
            activeConnections: this.requestMetrics.active,
        };
    }

    /**
     * Check if system is healthy
     */
    isHealthy(): boolean {
        const metrics = this.getHealthMetrics();
        return metrics.status === 'healthy';
    }

    /**
     * Calculate average
     */
    private calculateAverage(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Calculate percentile
     */
    private calculatePercentile(values: number[], percentile: number): number {
        if (values.length === 0) return 0;
        const index = Math.ceil((percentile / 100) * values.length) - 1;
        return values[index] || 0;
    }

    /**
     * Calculate throughput (requests per second)
     */
    private calculateThroughput(): number {
        const uptime = (Date.now() - this.startTime.getTime()) / 1000;
        return uptime > 0 ? this.requestMetrics.total / uptime : 0;
    }

    /**
     * Get CPU usage percentage
     */
    private getCPUUsage(): number {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        for (const cpu of cpus) {
            for (const type in cpu.times) {
                totalTick += cpu.times[type as keyof typeof cpu.times];
            }
            totalIdle += cpu.times.idle;
        }

        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const usage = 100 - ~~((100 * idle) / total);

        return usage;
    }

    /**
     * Start periodic metrics collection
     */
    private startMetricsCollection(): void {
        setInterval(() => {
            if (this.config.detailedMetrics) {
                const metrics = this.getHealthMetrics();
                // In production, you would send these to a monitoring service
                console.log('[METRICS]', JSON.stringify(metrics, null, 2));
            }
        }, this.config.metricsInterval);
    }

    /**
     * Reset metrics
     */
    reset(): void {
        this.requestMetrics = {
            total: 0,
            active: 0,
            queued: 0,
            failed: 0,
            responseTimes: [],
        };
        this.startTime = new Date();
    }
}
