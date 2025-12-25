import {
    CacheConfig,
    CacheEntry,
} from '../types/performance.types';

/**
 * Multi-layer cache service with LRU eviction
 */
export class CacheService {
    private cache: Map<string, CacheEntry> = new Map();
    private config: CacheConfig;
    private currentSize: number = 0; // in bytes

    constructor(config: CacheConfig) {
        this.config = config;
        this.startCleanupInterval();
    }

    /**
     * Get value from cache
     */
    get<T = any>(key: string): T | null {
        const fullKey = this.getFullKey(key);
        const entry = this.cache.get(fullKey);

        if (!entry) {
            return null;
        }

        // Check if expired
        const now = new Date();
        const age = (now.getTime() - entry.timestamp.getTime()) / 1000;

        if (age > entry.ttl) {
            this.delete(key);
            return null;
        }

        // Update hits and last access (LRU)
        entry.hits++;
        entry.timestamp = now;
        this.cache.set(fullKey, entry);

        return entry.value as T;
    }

    /**
     * Set value in cache
     */
    set<T = any>(key: string, value: T, ttl?: number): boolean {
        if (!this.config.enabled) {
            return false;
        }

        const fullKey = this.getFullKey(key);
        const entrySize = this.estimateSize(value);

        // Check if we need to evict entries
        while (
            this.currentSize + entrySize > this.config.maxSize * 1024 * 1024 &&
            this.cache.size > 0
        ) {
            this.evictOne();
        }

        const entry: CacheEntry<T> = {
            key: fullKey,
            value,
            timestamp: new Date(),
            ttl: ttl || this.config.ttl,
            hits: 0,
            size: entrySize,
        };

        this.cache.set(fullKey, entry);
        this.currentSize += entrySize;

        return true;
    }

    /**
     * Delete value from cache
     */
    delete(key: string): boolean {
        const fullKey = this.getFullKey(key);
        const entry = this.cache.get(fullKey);

        if (!entry) {
            return false;
        }

        this.currentSize -= entry.size;
        return this.cache.delete(fullKey);
    }

    /**
     * Check if key exists in cache
     */
    has(key: string): boolean {
        const fullKey = this.getFullKey(key);
        const entry = this.cache.get(fullKey);

        if (!entry) {
            return false;
        }

        // Check if expired
        const now = new Date();
        const age = (now.getTime() - entry.timestamp.getTime()) / 1000;

        if (age > entry.ttl) {
            this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
        this.currentSize = 0;
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        entries: number;
        hitRate: number;
        memoryUsage: number;
    } {
        let totalHits = 0;
        let totalAccesses = 0;

        for (const entry of this.cache.values()) {
            totalHits += entry.hits;
            totalAccesses += entry.hits + 1; // +1 for initial set
        }

        return {
            size: this.cache.size,
            entries: this.cache.size,
            hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
            memoryUsage: this.currentSize / (1024 * 1024), // MB
        };
    }

    /**
     * Evict one entry based on strategy
     */
    private evictOne(): void {
        if (this.cache.size === 0) return;

        let entryToEvict: [string, CacheEntry] | null = null;

        switch (this.config.strategy) {
            case 'lru': // Least Recently Used
                let oldestTime = Date.now();
                for (const [key, entry] of this.cache.entries()) {
                    if (entry.timestamp.getTime() < oldestTime) {
                        oldestTime = entry.timestamp.getTime();
                        entryToEvict = [key, entry];
                    }
                }
                break;

            case 'lfu': // Least Frequently Used
                let lowestHits = Infinity;
                for (const [key, entry] of this.cache.entries()) {
                    if (entry.hits < lowestHits) {
                        lowestHits = entry.hits;
                        entryToEvict = [key, entry];
                    }
                }
                break;

            case 'fifo': // First In First Out
                entryToEvict = Array.from(this.cache.entries())[0];
                break;
        }

        if (entryToEvict) {
            this.currentSize -= entryToEvict[1].size;
            this.cache.delete(entryToEvict[0]);
        }
    }

    /**
     * Estimate size of value in bytes
     */
    private estimateSize(value: any): number {
        const str = JSON.stringify(value);
        return new Blob([str]).size;
    }

    /**
     * Get full cache key with prefix
     */
    private getFullKey(key: string): string {
        return this.config.keyPrefix
            ? `${this.config.keyPrefix}:${key}`
            : key;
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = new Date();

        for (const [key, entry] of this.cache.entries()) {
            const age = (now.getTime() - entry.timestamp.getTime()) / 1000;

            if (age > entry.ttl) {
                this.currentSize -= entry.size;
                this.cache.delete(key);
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
}
