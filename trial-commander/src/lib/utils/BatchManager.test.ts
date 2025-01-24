import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BatchManager, type BatchOptions } from './BatchManager';
import { writable } from 'svelte/store';

// Mock window APIs
const mockWindow = {
    setTimeout: vi.fn(),
    clearTimeout: vi.fn()
};

describe('BatchManager', () => {
    let manager: BatchManager;
    let options: BatchOptions;
    let store1: any;
    let store2: any;
    let currentTime: number;

    beforeEach(() => {
        // Setup window mocks
        vi.stubGlobal('window', mockWindow);
        currentTime = 0;
        vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

        // Setup test stores
        store1 = writable('initial1');
        store2 = writable('initial2');

        options = {
            debounceMs: 10,
            maxBatchSize: 5,
            priority: 'normal'
        };

        manager = new BatchManager(options);
        manager.registerStore('store1', store1);
        manager.registerStore('store2', store2);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        manager.destroy();
    });

    it('registers and unregisters stores', () => {
        const store3 = writable('test');
        manager.registerStore('store3', store3);
        
        const txId = manager.startTransaction();
        expect(() => manager.addUpdate(txId, 'store3', 'new value')).not.toThrow();

        manager.unregisterStore('store3');
        expect(() => manager.addUpdate(txId, 'store3', 'newer value')).toThrow();
    });

    it('creates transactions with unique IDs', () => {
        const tx1 = manager.startTransaction();
        const tx2 = manager.startTransaction();
        expect(tx1).not.toBe(tx2);
    });

    it('batches multiple updates', () => {
        const txId = manager.startTransaction();
        const store1Spy = vi.fn();
        store1.subscribe(store1Spy);

        manager.addUpdate(txId, 'store1', 'value1');
        manager.addUpdate(txId, 'store1', 'value2');

        // Process the batch
        (manager as any).processNextBatch();

        // Should only be called once with the latest value
        expect(store1Spy).toHaveBeenCalledWith('value2');
    });

    it('respects priority order', () => {
        const lowTx = manager.startTransaction({ priority: 'low' });
        const normalTx = manager.startTransaction({ priority: 'normal' });
        const highTx = manager.startTransaction({ priority: 'high' });

        manager.addUpdate(lowTx, 'store1', 'low');
        manager.addUpdate(normalTx, 'store1', 'normal');
        manager.addUpdate(highTx, 'store1', 'high');

        // Process the batch
        (manager as any).processNextBatch();

        // Should process high priority first
        expect((manager as any).batchQueue.length).toBe(0);
        const store1Value = vi.fn();
        store1.subscribe(store1Value);
        expect(store1Value).toHaveBeenLastCalledWith('high');
    });

    it('handles immediate transaction commits', () => {
        const txId = manager.startTransaction();
        const store1Spy = vi.fn();
        store1.subscribe(store1Spy);

        manager.addUpdate(txId, 'store1', 'test');
        manager.commitTransaction(txId);

        expect(store1Spy).toHaveBeenCalledWith('test');
    });

    it('respects batch size limits', () => {
        const updates = [];
        for (let i = 0; i < options.maxBatchSize! * 2; i++) {
            const txId = manager.startTransaction();
            manager.addUpdate(txId, 'store1', `value${i}`);
            updates.push(txId);
        }

        // Process first batch
        (manager as any).processNextBatch();

        // Should have remaining transactions
        expect((manager as any).batchQueue.length).toBe(options.maxBatchSize);
    });

    it('handles transaction failures', () => {
        const txId = manager.startTransaction();
        const failingStore = writable('test');
        failingStore.set = vi.fn().mockImplementation(() => {
            throw new Error('Update failed');
        });

        manager.registerStore('failingStore', failingStore);
        manager.addUpdate(txId, 'failingStore', 'new value');

        expect(() => (manager as any).processNextBatch()).toThrow();
        const transaction = (manager as any).batchQueue.find((tx: any) => tx.id === txId);
        expect(transaction?.status).toBe('failed');
    });

    it('debounces rapid updates', () => {
        const txId = manager.startTransaction();
        manager.addUpdate(txId, 'store1', 'value1');
        manager.addUpdate(txId, 'store1', 'value2');
        manager.addUpdate(txId, 'store1', 'value3');

        expect(mockWindow.setTimeout).toHaveBeenCalledTimes(3);
        expect(mockWindow.clearTimeout).toHaveBeenCalledTimes(2);
    });

    it('cleans up resources on destroy', () => {
        const timeoutId = 123;
        (manager as any).updateTimeout = timeoutId;

        manager.destroy();

        expect(mockWindow.clearTimeout).toHaveBeenCalledWith(timeoutId);
        expect((manager as any).batchQueue.length).toBe(0);
        expect((manager as any).stores.size).toBe(0);
    });

    it('validates transaction and store existence', () => {
        const txId = manager.startTransaction();
        
        // Invalid transaction ID
        expect(() => manager.addUpdate('invalid_tx', 'store1', 'test')).toThrow();
        
        // Invalid store ID
        expect(() => manager.addUpdate(txId, 'invalid_store', 'test')).toThrow();
        
        // Already completed transaction
        manager.commitTransaction(txId);
        expect(() => manager.addUpdate(txId, 'store1', 'test')).toThrow();
    });
});
