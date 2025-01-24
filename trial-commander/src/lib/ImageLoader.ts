interface CacheEntry {
  image: HTMLImageElement;
  timestamp: number;
}

export class ImageLoader {
  private cache: Map<string, CacheEntry>;
  private cacheSize: number;
  private cacheTimeout: number; // milliseconds

  constructor(cacheSize = 10, cacheTimeout = 5 * 60 * 1000) { // 5 minutes default timeout
    this.cache = new Map();
    this.cacheSize = cacheSize;
    this.cacheTimeout = cacheTimeout;
  }

  async loadImage(path: string): Promise<HTMLImageElement> {
    // Check cache first
    const cached = this.cache.get(path);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.image;
    }

    // Load image
    const image = new Image();
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = reject;
    });

    image.src = path;
    
    try {
      await loadPromise;
      
      // Add to cache
      this.cache.set(path, {
        image,
        timestamp: Date.now()
      });

      // Clean cache if needed
      if (this.cache.size > this.cacheSize) {
        const oldestKey = [...this.cache.entries()]
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
        this.cache.delete(oldestKey);
      }

      return image;
    } catch (error) {
      throw new Error(`Failed to load image: ${path}`);
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
