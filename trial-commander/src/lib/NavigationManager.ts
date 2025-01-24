export class NavigationManager {
  private currentIndex: number;
  private images: string[];

  constructor(images: string[] = []) {
    this.images = images;
    this.currentIndex = 0;
  }

  getCurrentImage(): string | null {
    return this.images[this.currentIndex] || null;
  }

  nextImage(): string | null {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      return this.getCurrentImage();
    }
    return null;
  }

  previousImage(): string | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.getCurrentImage();
    }
    return null;
  }

  jumpToImage(batesNumber: string): string | null {
    const index = this.images.findIndex(path => path.includes(batesNumber));
    if (index !== -1) {
      this.currentIndex = index;
      return this.getCurrentImage();
    }
    return null;
  }

  setImages(images: string[]) {
    this.images = images;
    this.currentIndex = 0;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTotalImages(): number {
    return this.images.length;
  }

  hasNext(): boolean {
    return this.currentIndex < this.images.length - 1;
  }

  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Gets all images in the navigation
   * @returns Array of image paths
   */
  getAllImages(): string[] {
    return [...this.images];
  }
}
