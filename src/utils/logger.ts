import winston from 'winston';
import { LoggingConfig } from '../types';

export function createLogger(config?: LoggingConfig): winston.Logger {
    const level = config?.level || 'info';
    const includeTimestamp = config?.includeTimestamp !== false;

    const format = winston.format.combine(
        ...(includeTimestamp ? [winston.format.timestamp()] : []),
        winston.format.errors({ stack: true }),
        winston.format.json()
    );

    const transports: winston.transport[] = [];

    if (config?.destination === 'file' && config.filePath) {
        transports.push(
            new winston.transports.File({
                filename: config.filePath,
                level,
            })
        );
    } else if (config?.destination === 'custom' && config.customLogger) {
        // Use custom logger
        return config.customLogger as winston.Logger;
    } else {
        // Default to console
        transports.push(
            new winston.transports.Console({
                level,
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                ),
            })
        );
    }

    return winston.createLogger({
        level,
        format,
        transports,
    });
}
