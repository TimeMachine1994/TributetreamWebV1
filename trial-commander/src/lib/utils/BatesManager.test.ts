import { describe, it, expect, beforeEach } from 'vitest';
import { BatesManager, type BatesConfig } from './BatesManager';

describe('BatesManager', () => {
  let batesManager: BatesManager;
  const defaultConfig: BatesConfig = {
    prefix: 'EXH',
    startNumber: 1,
    padLength: 4
  };

  beforeEach(() => {
    batesManager = new BatesManager(defaultConfig);
  });

  describe('generateBatesNumber', () => {
    it('should generate correctly formatted Bates numbers', () => {
      expect(batesManager.generateBatesNumber()).toBe('EXH0001');
      expect(batesManager.generateBatesNumber()).toBe('EXH0002');
      expect(batesManager.generateBatesNumber()).toBe('EXH0003');
    });

    it('should handle different prefix and padding configurations', () => {
      const customManager = new BatesManager({
        prefix: 'DOC',
        startNumber: 100,
        padLength: 3
      });
      expect(customManager.generateBatesNumber()).toBe('DOC100');
      expect(customManager.generateBatesNumber()).toBe('DOC101');
    });
  });

  describe('createBatesIndex', () => {
    it('should create index mapping Bates numbers to file paths', () => {
      const filePaths = [
        'path/to/file1.jpg',
        'path/to/file2.jpg',
        'path/to/file3.jpg'
      ];
      const index = batesManager.createBatesIndex(filePaths);
      
      expect(Object.keys(index)).toHaveLength(3);
      expect(Object.values(index)).toEqual(filePaths);
      expect(Object.keys(index)[0]).toBe('EXH0001');
      expect(Object.keys(index)[1]).toBe('EXH0002');
      expect(Object.keys(index)[2]).toBe('EXH0003');
    });
  });

  describe('searchByBates', () => {
    beforeEach(() => {
      batesManager.createBatesIndex([
        'path/to/file1.jpg',
        'path/to/file2.jpg',
        'path/to/file3.jpg'
      ]);
    });

    it('should find exact matches', () => {
      const results = batesManager.searchByBates('EXH0001');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        batesNumber: 'EXH0001',
        filePath: 'path/to/file1.jpg'
      });
    });

    it('should find partial matches', () => {
      const results = batesManager.searchByBates('EXH');
      expect(results).toHaveLength(3);
    });

    it('should be case insensitive', () => {
      const results = batesManager.searchByBates('exh');
      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', () => {
      const results = batesManager.searchByBates('XYZ');
      expect(results).toHaveLength(0);
    });
  });

  describe('getBatesNumberForFile', () => {
    beforeEach(() => {
      batesManager.createBatesIndex([
        'path/to/file1.jpg',
        'path/to/file2.jpg'
      ]);
    });

    it('should return Bates number for existing file', () => {
      const batesNumber = batesManager.getBatesNumberForFile('path/to/file1.jpg');
      expect(batesNumber).toBe('EXH0001');
    });

    it('should return null for non-existent file', () => {
      const batesNumber = batesManager.getBatesNumberForFile('non/existent.jpg');
      expect(batesNumber).toBeNull();
    });
  });

  describe('getFilePathForBates', () => {
    beforeEach(() => {
      batesManager.createBatesIndex([
        'path/to/file1.jpg',
        'path/to/file2.jpg'
      ]);
    });

    it('should return file path for existing Bates number', () => {
      const filePath = batesManager.getFilePathForBates('EXH0001');
      expect(filePath).toBe('path/to/file1.jpg');
    });

    it('should return null for non-existent Bates number', () => {
      const filePath = batesManager.getFilePathForBates('EXH9999');
      expect(filePath).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset numbering and clear index', () => {
      batesManager.createBatesIndex(['path/to/file1.jpg']);
      batesManager.reset();
      
      expect(batesManager.generateBatesNumber()).toBe('EXH0001');
      expect(batesManager.getBatesIndex()).toEqual({});
    });
  });
});
