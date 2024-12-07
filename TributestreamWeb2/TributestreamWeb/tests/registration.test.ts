import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http } from 'msw'
import { server } from '../src/mocks/node'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('User Registration API', () => {
    it('successfully registers a new user', async () => {
        const testUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'securepass123',
            meta: {
                full_name: 'Test User',
                loved_one_name: 'Loved One',
                phone: '123-456-7890'
            }
        }

        const response = await fetch('http://localhost/wp-json/tributestream/v1/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        })

        const data = await response.json()
        
        expect(response.status).toBe(201)
        expect(data).toEqual({
            user_id: expect.any(String),
            message: 'User registered successfully'
        })
    })
})
