import { setupWorker } from 'msw';
import { handlers } from './handlers';

// Initialize a Service Worker with the request handlers.
export const worker = setupWorker(...handlers);
