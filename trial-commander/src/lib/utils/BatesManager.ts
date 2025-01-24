import { v4 as uuidv4 } from 'uuid';

export interface BatesIndex {
  [batesNumber: string]: string; // Maps bates numbers to file paths
}

export interface BatesConfig {
  prefix: string;
  startNumber: number;
  padLength: number;
}

export class BatesManager {
  private index: BatesIndex = {};
  private config: BatesConfig;
  private currentNumber: number;

  constructor(config: BatesConfig) {
    this.config = config;
    this.currentNumber = config.startNumber;
  }

  /**
   * Generates a new Bates number based on the configured format
   * @returns The generated Bates number
   */
  generateBatesNumber(): string {
    const paddedNumber = String(this.currentNumber).padStart(this.config.padLength, '0');
    const batesNumber = `${this.config.prefix}${paddedNumber}`;
    this.currentNumber++;
    return batesNumber;
  }

  /**
   * Creates a Bates index for a set of files
   * @param filePaths Array of file paths to index
   * @returns Object mapping Bates numbers to file paths
   */
  createBatesIndex(filePaths: string[]): BatesIndex {
    filePaths.forEach(path => {
      const batesNumber = this.generateBatesNumber();
      this.index[batesNumber] = path;
    });
    return this.index;
  }

  /**
   * Searches for files by Bates number
   * @param query The Bates number or partial number to search for
   * @returns Array of matching file paths and their Bates numbers
   */
  searchByBates(query: string): Array<{ batesNumber: string; filePath: string }> {
    const normalizedQuery = query.toLowerCase();
    return Object.entries(this.index)
      .filter(([batesNumber]) => batesNumber.toLowerCase().includes(normalizedQuery))
      .map(([batesNumber, filePath]) => ({
        batesNumber,
        filePath
      }));
  }

  /**
   * Gets the Bates number for a specific file path
   * @param filePath The file path to look up
   * @returns The associated Bates number or null if not found
   */
  getBatesNumberForFile(filePath: string): string | null {
    const entry = Object.entries(this.index).find(([_, path]) => path === filePath);
    return entry ? entry[0] : null;
  }

  /**
   * Gets the file path for a specific Bates number
   * @param batesNumber The Bates number to look up
   * @returns The associated file path or null if not found
   */
  getFilePathForBates(batesNumber: string): string | null {
    return this.index[batesNumber] || null;
  }

  /**
   * Gets the current Bates index
   * @returns The complete Bates index
   */
  getBatesIndex(): BatesIndex {
    return { ...this.index };
  }

  /**
   * Resets the Bates numbering to the start number
   */
  reset(): void {
    this.currentNumber = this.config.startNumber;
    this.index = {};
  }
}
