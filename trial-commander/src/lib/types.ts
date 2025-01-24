export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  type: 'drawing' | 'shape' | 'text';
  points: Point[];
  style: {
    color?: string;
    width?: number;
    opacity?: number;
  };
  text?: string; // Optional text content for text annotations
}

export interface ViewerState {
  scale: number;
  position: Point;
  rotation: number;
}

export interface ImageViewerState extends ViewerState {
  imagePath: string | null;
  batesNumber: string | null;
}

export interface ViewerEvents {
  onZoom: (scale: number) => void;
  onPan: (position: Point) => void;
  onRotate: (rotation: number) => void;
  onAnnotationStart: () => void;
  onAnnotationEnd: () => void;
  onError: (error: Error) => void;
}

export type ToolType = 'pan' | 'draw' | 'shape' | 'text';

export interface ToolState {
  type: ToolType;
  style: {
    color: string;
    width: number;
    opacity: number;
  };
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  annotations: Annotation[];
}

export interface LayerState {
  layers: Layer[];
  activeLayerId: string | null;
}

export interface LayerEvents {
  onLayerAdd: (layer: Layer) => void;
  onLayerRemove: (layerId: string) => void;
  onLayerUpdate: (layer: Layer) => void;
  onActiveLayerChange: (layerId: string | null) => void;
}
