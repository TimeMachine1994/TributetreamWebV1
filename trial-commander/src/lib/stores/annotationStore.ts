import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

interface Point {
  x: number;
  y: number;
}

interface Annotation {
  id: string;
  type: 'drawing' | 'shape' | 'text';
  points: Point[];
  style: {
    color?: string;
    width?: number;
    opacity?: number;
  };
}

interface HistoryEntry {
  timestamp: string;
  action: 'add' | 'delete' | 'modify' | 'clear';
  data: {
    annotationId?: string;
    annotation?: Annotation;
    annotations?: Annotation[];
  };
}

interface AnnotationState {
  annotations: Annotation[];
  history: HistoryEntry[];
  currentIndex: number; // For undo/redo
}

function createAnnotationStore() {
  const initialState: AnnotationState = {
    annotations: [],
    history: [],
    currentIndex: -1
  };

  const { subscribe, set, update } = writable<AnnotationState>(initialState);

  function addHistoryEntry(entry: HistoryEntry, state: AnnotationState): AnnotationState {
    // Remove any future history entries if we're not at the end
    const newHistory = state.history.slice(0, state.currentIndex + 1);
    return {
      ...state,
      history: [...newHistory, entry],
      currentIndex: state.currentIndex + 1
    };
  }

  return {
    subscribe,

    addAnnotation: (annotation: Annotation) => {
      update(state => {
        const historyEntry: HistoryEntry = {
          timestamp: new Date().toISOString(),
          action: 'add',
          data: { annotation }
        };

        const newState = addHistoryEntry(historyEntry, state);
        return {
          ...newState,
          annotations: [...state.annotations, annotation]
        };
      });
    },

    deleteAnnotation: (id: string) => {
      update(state => {
        const annotation = state.annotations.find(a => a.id === id);
        if (!annotation) return state;

        const historyEntry: HistoryEntry = {
          timestamp: new Date().toISOString(),
          action: 'delete',
          data: { annotationId: id, annotation }
        };

        const newState = addHistoryEntry(historyEntry, state);
        return {
          ...newState,
          annotations: state.annotations.filter(a => a.id !== id)
        };
      });
    },

    modifyAnnotation: (id: string, changes: Partial<Annotation>) => {
      update(state => {
        const index = state.annotations.findIndex(a => a.id === id);
        if (index === -1) return state;

        const oldAnnotation = state.annotations[index];
        const newAnnotation = { ...oldAnnotation, ...changes };

        const historyEntry: HistoryEntry = {
          timestamp: new Date().toISOString(),
          action: 'modify',
          data: { 
            annotationId: id,
            annotation: oldAnnotation
          }
        };

        const newState = addHistoryEntry(historyEntry, state);
        const newAnnotations = [...state.annotations];
        newAnnotations[index] = newAnnotation;

        return {
          ...newState,
          annotations: newAnnotations
        };
      });
    },

    clear: () => {
      update(state => {
        const historyEntry: HistoryEntry = {
          timestamp: new Date().toISOString(),
          action: 'clear',
          data: { annotations: state.annotations }
        };

        const newState = addHistoryEntry(historyEntry, state);
        return {
          ...newState,
          annotations: []
        };
      });
    },

    undo: () => {
      update(state => {
        if (state.currentIndex < 0) return state;

        const entry = state.history[state.currentIndex];
        let newAnnotations = [...state.annotations];

        switch (entry.action) {
          case 'add':
            newAnnotations = newAnnotations.filter(a => a.id !== entry.data.annotation!.id);
            break;
          case 'delete':
            newAnnotations = [...newAnnotations, entry.data.annotation!];
            break;
          case 'modify':
            const index = newAnnotations.findIndex(a => a.id === entry.data.annotationId);
            if (index !== -1) {
              newAnnotations[index] = entry.data.annotation!;
            }
            break;
          case 'clear':
            newAnnotations = entry.data.annotations!;
            break;
        }

        return {
          ...state,
          annotations: newAnnotations,
          currentIndex: state.currentIndex - 1
        };
      });
    },

    redo: () => {
      update(state => {
        if (state.currentIndex >= state.history.length - 1) return state;

        const entry = state.history[state.currentIndex + 1];
        let newAnnotations = [...state.annotations];

        switch (entry.action) {
          case 'add':
            newAnnotations = [...newAnnotations, entry.data.annotation!];
            break;
          case 'delete':
            newAnnotations = newAnnotations.filter(a => a.id !== entry.data.annotationId);
            break;
          case 'modify':
            const index = newAnnotations.findIndex(a => a.id === entry.data.annotationId);
            if (index !== -1) {
              newAnnotations[index] = { ...newAnnotations[index], ...entry.data.annotation };
            }
            break;
          case 'clear':
            newAnnotations = [];
            break;
        }

        return {
          ...state,
          annotations: newAnnotations,
          currentIndex: state.currentIndex + 1
        };
      });
    },

    reset: () => {
      set(initialState);
    }
  };
}

export const annotationStore = createAnnotationStore();
