import { describe, it, expect, beforeAll } from 'vitest';
import { POST } from './+server';
import { GET } from '../getRole/+server';

// Test user credentials (should exist in your local WordPress)
const TEST_USER = {
    username: 'admin',
    password: 'admin'  // Make sure this matches your local WordPress admin password
};

describe('Authentication and Role Handling', () => {
    let authToken: string;
    let userId: string;

    describe('POST /api/auth', () => {
        it('should authenticate admin user', async () => {
            const request = new Request('http://localhost/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(TEST_USER)
            });

            const cookies: Record<string, string> = {};
            const response = await POST({
                request,
                cookies: {
                    set: (name: string, value: string) => {
                        cookies[name] = value;
                    }
                }
            } as any);

            const data = await response.json();

            // Verify successful authentication
            expect(data.success).toBe(true);
            expect(data.user_id).toBeDefined();
            expect(data.user_display_name).toBeDefined();
            expect(cookies.auth_token).toBeDefined();

            // Store token and user ID for subsequent tests
            authToken = cookies.auth_token;
            userId = data.user_id;
        });

        it('should reject invalid credentials', async () => {
            const request = new Request('http://localhost/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'wrong',
                    password: 'wrong'
                })
            });

            try {
                await POST({
                    request,
                    cookies: {}
                } as any);
                throw new Error('Should have thrown');
            } catch (error: any) {
                expect(error.status).toBe(401);
            }
        });
    });

    describe('GET /api/getRole', () => {
        it('should fetch admin role', async () => {
            // Skip if auth failed
            if (!userId) {
                console.warn('Skipping role test - auth failed');
                return;
            }

            const url = new URL(`http://localhost/api/getRole?id=${userId}`);
            
            const response = await GET({
                url,
                request: new Request(url, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                })
            } as any);

            const data = await response.json();

            // Verify admin role
            expect(data.success).toBe(true);
            expect(data.roles).toContain('administrator');
            expect(data.role).toBe('administrator');
        });

        it('should handle missing user ID', async () => {
            const url = new URL('http://localhost/api/getRole');
            
            const response = await GET({
                url,
                request: new Request(url)
            } as any);

            const data = await response.json();
            expect(data.error).toBe('User ID is required');
        });
    });
});