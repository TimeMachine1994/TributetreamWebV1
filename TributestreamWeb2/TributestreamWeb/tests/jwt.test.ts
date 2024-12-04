import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '../src/mocks/node'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('JWT Authentication API', () => {
    it('successfully generates a token with valid credentials', async () => {
        const response = await fetch('http://localhost/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'password'
            })
        })

        const data = await response.json()
        expect(response.ok).toBe(true)
        expect(data.token).toBeDefined()
        expect(data.user_display_name).toBe('admin')
    })

    it('returns error with invalid credentials', async () => {
        const response = await fetch('http://localhost/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'wrong',
                password: 'wrong'
            })
        })

        const data = await response.json()
        expect(response.status).toBe(403)
        expect(data.code).toBe('jwt_auth_failed')
    })

    it('validates a valid token', async () => {
        const response = await fetch('http://localhost/wp-json/jwt-auth/v1/token/validate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.example.token'
            }
        })

        const data = await response.json()
        expect(response.ok).toBe(true)
        expect(data.code).toBe('jwt_auth_valid_token')
    })

    it('rejects invalid token', async () => {
        const response = await fetch('http://localhost/wp-json/jwt-auth/v1/token/validate', {
            method: 'POST',
            headers: {
                'Authorization': 'Invalid-Token'
            }
        })

        const data = await response.json()
        expect(response.status).toBe(403)
        expect(data.code).toBe('jwt_auth_invalid_token')
    })
})
