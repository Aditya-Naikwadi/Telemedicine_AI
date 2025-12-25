import {
    LoadBalancerConfig,
    LoadBalancingStrategy,
    AgentInstance,
} from '../types/performance.types';

/**
 * Load balancer service for distributing requests across multiple agent instances
 */
export class LoadBalancerService {
    private config: LoadBalancerConfig;
    private currentIndex: number = 0;

    constructor(config: LoadBalancerConfig) {
        this.config = config;
        if (this.config.enabled) {
            this.startHealthChecks();
        }
    }

    /**
     * Get next instance based on load balancing strategy
     */
    getNextInstance(): AgentInstance | null {
        if (!this.config.enabled || this.config.instances.length === 0) {
            return null;
        }

        const healthyInstances = this.config.instances.filter((i) => i.isHealthy);

        if (healthyInstances.length === 0) {
            return null;
        }

        let instance: AgentInstance;

        switch (this.config.strategy) {
            case 'round-robin':
                instance = this.roundRobin(healthyInstances);
                break;

            case 'least-connections':
                instance = this.leastConnections(healthyInstances);
                break;

            case 'weighted-round-robin':
                instance = this.weightedRoundRobin(healthyInstances);
                break;

            case 'health-based':
                instance = this.healthBased(healthyInstances);
                break;

            default:
                instance = this.roundRobin(healthyInstances);
        }

        // Increment connection count
        instance.activeConnections++;
        instance.totalRequests++;

        return instance;
    }

    /**
     * Release instance after request completion
     */
    releaseInstance(instanceId: string): void {
        const instance = this.config.instances.find((i) => i.id === instanceId);
        if (instance && instance.activeConnections > 0) {
            instance.activeConnections--;
        }
    }

    /**
     * Round robin strategy
     */
    private roundRobin(instances: AgentInstance[]): AgentInstance {
        const instance = instances[this.currentIndex % instances.length];
        this.currentIndex++;
        return instance;
    }

    /**
     * Least connections strategy
     */
    private leastConnections(instances: AgentInstance[]): AgentInstance {
        return instances.reduce((prev, current) =>
            prev.activeConnections < current.activeConnections ? prev : current
        );
    }

    /**
     * Weighted round robin strategy
     */
    private weightedRoundRobin(instances: AgentInstance[]): AgentInstance {
        const totalWeight = instances.reduce((sum, i) => sum + i.weight, 0);
        let random = Math.random() * totalWeight;

        for (const instance of instances) {
            random -= instance.weight;
            if (random <= 0) {
                return instance;
            }
        }

        return instances[0];
    }

    /**
     * Health-based strategy (prefer healthier instances)
     */
    private healthBased(instances: AgentInstance[]): AgentInstance {
        // Sort by active connections (lower is better)
        const sorted = [...instances].sort(
            (a, b) => a.activeConnections - b.activeConnections
        );
        return sorted[0];
    }

    /**
     * Add instance to load balancer
     */
    addInstance(instance: AgentInstance): void {
        this.config.instances.push(instance);
    }

    /**
     * Remove instance from load balancer
     */
    removeInstance(instanceId: string): void {
        this.config.instances = this.config.instances.filter(
            (i) => i.id !== instanceId
        );
    }

    /**
     * Mark instance as unhealthy
     */
    markUnhealthy(instanceId: string): void {
        const instance = this.config.instances.find((i) => i.id === instanceId);
        if (instance) {
            instance.isHealthy = false;
        }
    }

    /**
     * Mark instance as healthy
     */
    markHealthy(instanceId: string): void {
        const instance = this.config.instances.find((i) => i.id === instanceId);
        if (instance) {
            instance.isHealthy = true;
        }
    }

    /**
     * Perform health check on instance
     */
    private async checkInstanceHealth(instance: AgentInstance): Promise<boolean> {
        try {
            // In a real implementation, this would ping the instance endpoint
            // For now, we'll just check if it has reasonable connection count
            const isHealthy = instance.activeConnections < 100;
            instance.lastHealthCheck = new Date();
            return isHealthy;
        } catch (error) {
            return false;
        }
    }

    /**
     * Start periodic health checks
     */
    private startHealthChecks(): void {
        setInterval(async () => {
            for (const instance of this.config.instances) {
                const isHealthy = await this.checkInstanceHealth(instance);

                if (isHealthy && !instance.isHealthy) {
                    // Instance recovered
                    instance.isHealthy = true;
                } else if (!isHealthy && instance.isHealthy) {
                    // Instance became unhealthy
                    instance.isHealthy = false;
                }
            }
        }, this.config.healthCheckInterval);
    }

    /**
     * Get load balancer statistics
     */
    getStats(): {
        totalInstances: number;
        healthyInstances: number;
        totalRequests: number;
        totalActiveConnections: number;
    } {
        const healthyInstances = this.config.instances.filter((i) => i.isHealthy);
        const totalRequests = this.config.instances.reduce(
            (sum, i) => sum + i.totalRequests,
            0
        );
        const totalActiveConnections = this.config.instances.reduce(
            (sum, i) => sum + i.activeConnections,
            0
        );

        return {
            totalInstances: this.config.instances.length,
            healthyInstances: healthyInstances.length,
            totalRequests,
            totalActiveConnections,
        };
    }
}
