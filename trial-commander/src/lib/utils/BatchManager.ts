import type { Writable } from 'svelte/store';

export interface BatchOptions {
    debounceMs?: number;
    maxBatchSize?: number;
    priority?: 'high' | 'normal' | 'low';
}

export interface BatchTransaction {
    id: string;
    changes: Map<string, any>;
    timestamp: number;
    priority: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class BatchManager {
    private static readonly DEFAULT_OPTIONS: Required<BatchOptions> = {
        debounceMs: 16, // One frame at 60fps
        maxBatchSize: 100,
        priority: 'normal'
    };

    private static readonly PRIORITY_LEVELS = {
        high: 0,
        normal: 1,
        low: 2
    };

    private batchQueue: BatchTransaction[];
    private stores: Map<string, Writable<any>>;
    private updateTimeout: number | null;
    private options: Required<BatchOptions>;
    private transactionCounter: number;

    constructor(options: BatchOptions = {}) {
        this.options = { ...BatchManager.DEFAULT_OPTIONS, ...options };
        this.batchQueue = [];
        this.stores = new Map();
        this.updateTimeout = null;
        this.transactionCounter = 0;
    }

    /**
     * Register a store for batch updates
     */
    registerStore(id: string, store: Writable<any>): void {
        this.stores.set(id, store);
    }

    /**
     * Unregister a store
     */
    unregisterStore(id: string): void {
        this.stores.delete(id);
    }

    /**
     * Start a new batch transaction
     */
    startTransaction(options: BatchOptions = {}): string {
        const id = `tx_${++this.transactionCounter}`;
        const transaction: BatchTransaction = {
            id,
            changes: new Map(),
            timestamp: Date.now(),
            priority: BatchManager.PRIORITY_LEVELS[options.priority || this.options.priority],
            status: 'pending'
        };

        this.batchQueue.push(transaction);
        return id;
    }

    /**
     * Add an update to a transaction
     */
    addUpdate(transactionId: string, storeId: string, value: any): void {
        const transaction = this.batchQueue.find(tx => tx.id === transactionId);
        if (!transaction || transaction.status !== 'pending') {
            throw new Error(`Invalid transaction: ${transactionId}`);
        }

        if (!this.stores.has(storeId)) {
            throw new Error(`Unknown store: ${storeId}`);
        }

        transaction.changes.set(storeId, value);
        this.scheduleBatchUpdate();
    }

    /**
     * Commit a transaction immediately
     */
    commitTransaction(transactionId: string): void {
        const transaction = this.batchQueue.find(tx => tx.id === transactionId);
        if (!transaction || transaction.status !== 'pending') {
            throw new Error(`Invalid transaction: ${transactionId}`);
        }

        this.processBatch([transaction]);
    }

    /**
     * Schedule a batch update
     */
    private scheduleBatchUpdate(): void {
        if (this.updateTimeout) {
            window.clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = window.setTimeout(
            () => this.processNextBatch(),
            this.options.debounceMs
        );
    }

    /**
     * Process the next batch of updates
     */
    private processNextBatch(): void {
        // Sort by priority and timestamp
        this.batchQueue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.timestamp - b.timestamp;
        });

        // Take up to maxBatchSize transactions
        const batch = this.batchQueue.splice(0, this.options.maxBatchSize);
        if (batch.length > 0) {
            this.processBatch(batch);
        }

        // Schedule next batch if there are remaining transactions
        if (this.batchQueue.length > 0) {
            this.scheduleBatchUpdate();
        }
    }

    /**
     * Process a batch of transactions
     */
    private processBatch(batch: BatchTransaction[]): void {
        // Group changes by store
        const storeUpdates = new Map<string, any>();

        for (const transaction of batch) {
            transaction.status = 'processing';
            
            for (const [storeId, value] of transaction.changes) {
                storeUpdates.set(storeId, value);
            }
        }

        // Apply updates to stores
        try {
            for (const [storeId, value] of storeUpdates) {
                const store = this.stores.get(storeId);
                if (store) {
                    store.set(value);
                }
            }

            // Mark transactions as completed
            batch.forEach(tx => tx.status = 'completed');
        } catch (error) {
            // Mark transactions as failed
            batch.forEach(tx => tx.status = 'failed');
            console.error('Batch update failed:', error);
            throw error;
        }
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        if (this.updateTimeout) {
            window.clearTimeout(this.updateTimeout);
        }
        this.batchQueue = [];
        this.stores.clear();
    }
}
