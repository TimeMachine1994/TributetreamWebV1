import type { Book, Page } from '../stores/books';
import { v4 as uuidv4 } from 'uuid';

export class FileSystemManager {
  private static readonly IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

  static isImageFile(filename: string): boolean {
    const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
    return this.IMAGE_EXTENSIONS.includes(extension);
  }

  static async scanDirectory(path: string): Promise<string[]> {
    try {
      // This will be replaced with actual file system access
      // when we implement the platform-specific file system integration
      return [];
    } catch (error) {
      console.error('Error scanning directory:', error);
      throw error;
    }
  }

  static async createBookStructure(folderPath: string): Promise<Book> {
    try {
      const folderName = folderPath.split('/').pop() || 'Unnamed Book';
      const imageFiles = await this.scanDirectory(folderPath);
      
      const pages: Page[] = imageFiles
        .filter(file => this.isImageFile(file))
        .map((file, index) => ({
          id: uuidv4(),
          path: `${folderPath}/${file}`,
          batesNumber: `EXH${String(index + 1).padStart(3, '0')}`,
          annotations: []
        }));

      return {
        id: uuidv4(),
        name: folderName,
        pages
      };
    } catch (error) {
      console.error('Error creating book structure:', error);
      throw error;
    }
  }
}
