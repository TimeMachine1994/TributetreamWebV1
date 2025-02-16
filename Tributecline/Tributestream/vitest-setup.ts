import { fetch, Request, Response } from 'undici';

// Make fetch available globally
globalThis.fetch = fetch;
globalThis.Request = Request;
globalThis.Response = Response;