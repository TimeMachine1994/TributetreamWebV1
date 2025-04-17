/**
 * Table of Contents item interface
 */
export interface TocItem {
  id: string;
  title: string;
  level: number;
  children?: TocItem[];
}