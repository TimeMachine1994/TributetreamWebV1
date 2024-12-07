import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { tributeService } from '../src/lib/api/unified-tributestream-plugin/tribute';

const server = setupServer(
    http.post('http://localhost/tributestream/v1/tribute', async ({ request }) => {
        const tributeData = await request.json();
        return HttpResponse.json(tributeData, { status: 201 });
    })
);

describe('Tribute Service', () => {
    beforeAll(() => server.listen());
    beforeEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('successfully creates a tribute page', async () => {
        const testTribute = {
            user_id: '12345',
            loved_one_name: 'John Doe',
            slug: 'john-doe-memorial'
        };

        const response = await tributeService.createTribute(testTribute);
        
        expect(response.status).toBe(201);
        expect(response.data).toEqual(testTribute);
    });
});
