import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { api } from '../src/lib/api/apiHandler';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Setup test server
const server = setupServer(
    // Mock endpoint for testing
    http.get('http://localhost/test-endpoint', () => {
        return HttpResponse.json({ message: 'success' })
    }),
    
    // Mock authenticated endpoint
    http.get('http://localhost/protected-endpoint', ({ request }) => {
        const authHeader = request.headers.get('Authorization')
        if (authHeader === 'Bearer test-token') {
            return HttpResponse.json({ message: 'authenticated' })
        }
        return new HttpResponse(null, { status: 401 })
    })
)

describe('ApiHandler', () => {
    // Start MSW server before tests
    beforeAll(() => server.listen())
    // Reset handlers after each test
    beforeEach(() => server.resetHandlers())
    // Clean up after all tests
    afterAll(() => server.close())

    it('successfully makes a basic request', async () => {
        const response = await api.request('/test-endpoint')
        expect(response.status).toBe(200)
        expect(response.data).toEqual({ message: 'success' })
    })

    it('handles authentication correctly', async () => {
        api.setToken('test-token')
        const response = await api.request('/protected-endpoint')
        expect(response.status).toBe(200)
        expect(response.data).toEqual({ message: 'authenticated' })
    })
})
