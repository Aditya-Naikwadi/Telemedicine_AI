import { QueueConfig, QueuedRequest } from '../types/performance.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request queue service for managing concurrent requests
 */
export class QueueService<T = any> {
    private queue: QueuedRequest<T>[] = [];
    private config: QueueConfig;
    private processing: number = 0;

    constructor(config: QueueConfig) {
        this.config = config;
    }

    /**
     * Add request to queue
     */
    async enqueue(
        data: T,
        priority: number = 0,
        timeout?: number
    ): Promise<any> {
        if (!this.config.enabled) {
            // Process immediately if queue is disabled
            return data;
        }

        // Check queue size
        if (this.queue.length >= this.config.maxSize) {
            throw new Error('Queue is full');
        }

        return new Promise((resolve, reject) => {
            const request: QueuedRequest<T> = {
                id: uuidv4(),
                data,
                priority,
                timestamp: new Date(),
                timeout: timeout || this.config.timeout,
                retries: 0,
                callback: (result) => {
                    if (result instanceof Error) {
                        reject(result);
                    } else {
                        resolve(result);
                    }
                },
            };

            this.queue.push(request);
            this.sortQueue();
            this.processQueue();

            // Set timeout
            setTimeout(() => {
                const index = this.queue.findIndex((r) => r.id === request.id);
                if (index !== -1) {
                    this.queue.splice(index, 1);
                    reject(new Error('Request timeout'));
                }
            }, request.timeout);
        });
    }

    /**
     * Process queue based on concurrency limit
     */
    private async processQueue(): Promise<void> {
        while (
            this.processing < this.config.concurrency &&
            this.queue.length > 0
        ) {
            const request = this.dequeue();
            if (request) {
                this.processing++;
                this.processRequest(request);
            }
        }
    }

    /**
     * Process individual request
     */
    private async processRequest(request: QueuedRequest<T>): Promise<void> {
        try {
            // In real implementation, this would process the actual request
            // For now, we just simulate processing
            await new Promise((resolve) => setTimeout(resolve, 100));

            if (request.callback) {
                request.callback(request.data);
            }
        } catch (error) {
            if (request.callback) {
                request.callback(error);
            }
        } finally {
            this.processing--;
            this.processQueue(); // Process next item
        }
    }

    /**
     * Dequeue next request based on strategy
     */
    private dequeue(): QueuedRequest<T> | undefined {
        if (this.queue.length === 0) {
            return undefined;
        }

        switch (this.config.strategy) {
            case 'fifo':
                return this.queue.shift();

            case 'lifo':
                return this.queue.pop();

            case 'priority':
                // Already sorted by priority
                return this.queue.shift();

            default:
                return this.queue.shift();
        }
    }

    /**
     * Sort queue by priority (higher priority first)
     */
    private sortQueue(): void {
        if (this.config.strategy === 'priority') {
            this.queue.sort((a, b) => b.priority - a.priority);
        }
    }

    /**
     * Get queue size
     */
    getSize(): number {
        return this.queue.length;
    }

    /**
     * Get processing count
     */
    getProcessing(): number {
        return this.processing;
    }

    /**
     * Get queue statistics
     */
    getStats(): {
        queueSize: number;
        processing: number;
        capacity: number;
        utilizationRate: number;
    } {
        return {
            queueSize: this.queue.length,
            processing: this.processing,
            capacity: this.config.maxSize,
            utilizationRate: this.queue.length / this.config.maxSize,
        };
    }

    /**
     * Clear queue
     */
    clear(): void {
        this.queue = [];
    }
}
