import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { annotationStore } from './annotationStore';

describe('annotationStore', () => {
  const testAnnotation = {
    id: 'test-id',
    type: 'drawing' as const,
    points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
    style: { color: '#000000', width: 2, opacity: 1 }
  };

  beforeEach(() => {
    annotationStore.reset();
  });

  it('should start with empty state', () => {
    const state = get(annotationStore);
    expect(state.annotations).toEqual([]);
    expect(state.history).toEqual([]);
    expect(state.currentIndex).toBe(-1);
  });

  it('should add annotation', () => {
    annotationStore.addAnnotation(testAnnotation);
    const state = get(annotationStore);
    
    expect(state.annotations).toHaveLength(1);
    expect(state.annotations[0]).toEqual(testAnnotation);
    expect(state.history).toHaveLength(1);
    expect(state.currentIndex).toBe(0);
  });

  it('should delete annotation', () => {
    annotationStore.addAnnotation(testAnnotation);
    annotationStore.deleteAnnotation(testAnnotation.id);
    const state = get(annotationStore);
    
    expect(state.annotations).toHaveLength(0);
    expect(state.history).toHaveLength(2);
    expect(state.currentIndex).toBe(1);
  });

  it('should modify annotation', () => {
    annotationStore.addAnnotation(testAnnotation);
    const changes = { style: { color: '#ff0000' } };
    annotationStore.modifyAnnotation(testAnnotation.id, changes);
    const state = get(annotationStore);
    
    expect(state.annotations[0].style.color).toBe('#ff0000');
    expect(state.history).toHaveLength(2);
    expect(state.currentIndex).toBe(1);
  });

  it('should clear all annotations', () => {
    annotationStore.addAnnotation(testAnnotation);
    annotationStore.clear();
    const state = get(annotationStore);
    
    expect(state.annotations).toHaveLength(0);
    expect(state.history).toHaveLength(2);
    expect(state.currentIndex).toBe(1);
  });

  it('should undo and redo operations', () => {
    // Add annotation
    annotationStore.addAnnotation(testAnnotation);
    let state = get(annotationStore);
    expect(state.annotations).toHaveLength(1);

    // Undo add
    annotationStore.undo();
    state = get(annotationStore);
    expect(state.annotations).toHaveLength(0);

    // Redo add
    annotationStore.redo();
    state = get(annotationStore);
    expect(state.annotations).toHaveLength(1);
  });

  it('should handle multiple undo/redo operations', () => {
    const annotation2 = { ...testAnnotation, id: 'test-id-2' };
    
    // Add two annotations
    annotationStore.addAnnotation(testAnnotation);
    annotationStore.addAnnotation(annotation2);
    let state = get(annotationStore);
    expect(state.annotations).toHaveLength(2);

    // Undo both adds
    annotationStore.undo();
    annotationStore.undo();
    state = get(annotationStore);
    expect(state.annotations).toHaveLength(0);

    // Redo both adds
    annotationStore.redo();
    annotationStore.redo();
    state = get(annotationStore);
    expect(state.annotations).toHaveLength(2);
  });

  it('should handle branching history', () => {
    // Add annotation
    annotationStore.addAnnotation(testAnnotation);
    
    // Modify it
    annotationStore.modifyAnnotation(testAnnotation.id, { style: { color: '#ff0000' } });
    
    // Undo back to original
    annotationStore.undo();
    
    // Make a different modification
    annotationStore.modifyAnnotation(testAnnotation.id, { style: { color: '#00ff00' } });
    
    const state = get(annotationStore);
    expect(state.annotations[0].style.color).toBe('#00ff00');
    expect(state.history).toHaveLength(2); // Original add + new modification
  });
});
