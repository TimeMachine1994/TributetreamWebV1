import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageLoader } from '../ImageLoader';
import { NavigationManager } from '../NavigationManager';

describe('Image Management System', () => {
  let imageLoader: ImageLoader;
  let navigationManager: NavigationManager;

  beforeEach(() => {
    imageLoader = new ImageLoader();
    navigationManager = new NavigationManager();
  });

  describe('ImageLoader', () => {
    it('should cache loaded images', async () => {
      const mockImage = new Image();
      const loadSpy = vi.spyOn(window, 'Image').mockImplementation(() => mockImage);
      
      // Simulate successful image load
      setTimeout(() => {
        mockImage.dispatchEvent(new Event('load'));
      }, 0);

      const path = 'test-image.jpg';
      await imageLoader.loadImage(path);
      await imageLoader.loadImage(path); // Second load should use cache

      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle load errors', async () => {
      const mockImage = new Image();
      vi.spyOn(window, 'Image').mockImplementation(() => mockImage);
      
      // Simulate failed image load
      setTimeout(() => {
        mockImage.dispatchEvent(new Event('error'));
      }, 0);

      const path = 'invalid-image.jpg';
      await expect(imageLoader.loadImage(path)).rejects.toThrow();
    });
  });

  describe('NavigationManager', () => {
    const testImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

    beforeEach(() => {
      navigationManager.setImages(testImages);
    });

    it('should navigate through images correctly', () => {
      expect(navigationManager.getCurrentImage()).toBe('image1.jpg');
      expect(navigationManager.hasNext()).toBe(true);
      expect(navigationManager.hasPrevious()).toBe(false);

      navigationManager.nextImage();
      expect(navigationManager.getCurrentImage()).toBe('image2.jpg');
      expect(navigationManager.hasNext()).toBe(true);
      expect(navigationManager.hasPrevious()).toBe(true);

      navigationManager.nextImage();
      expect(navigationManager.getCurrentImage()).toBe('image3.jpg');
      expect(navigationManager.hasNext()).toBe(false);
      expect(navigationManager.hasPrevious()).toBe(true);

      navigationManager.previousImage();
      expect(navigationManager.getCurrentImage()).toBe('image2.jpg');
    });

    it('should handle Bates number navigation', () => {
      const imagesWithBates = [
        'EXH001_image1.jpg',
        'EXH002_image2.jpg',
        'EXH003_image3.jpg'
      ];
      navigationManager.setImages(imagesWithBates);

      expect(navigationManager.jumpToImage('EXH002')).toBe('EXH002_image2.jpg');
      expect(navigationManager.getCurrentIndex()).toBe(1);

      expect(navigationManager.jumpToImage('INVALID')).toBe(null);
    });
  });
});
