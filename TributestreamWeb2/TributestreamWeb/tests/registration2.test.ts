import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { registrationService } from '../src/lib/api/unified-tributestream-plugin/register';

const server = setupServer(
    http.post('http://localhost/tributestream/v1/register', async ({ request }) => {
        const userData = await request.json();
        
        return HttpResponse.json({
            user_id: '12345',
            message: 'User registered successfully'
        }, { status: 201 });
    })
);

describe('Registration Service', () => {
    beforeAll(() => server.listen());
    beforeEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('successfully registers a new user', async () => {
        const testUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        const response = await registrationService.register(testUser);
        
        expect(response.status).toBe(201);
        expect(response.data).toEqual({
            user_id: '12345',
            message: 'User registered successfully'
        });
    });
});
