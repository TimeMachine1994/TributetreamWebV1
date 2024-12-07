import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http } from 'msw'
import { server } from '../src/mocks/node'

// Setup MSW
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Tribute API', () => {it('successfully creates a tribute', async () => {
    const testData = {
      user_id: '123',
      loved_one_name: 'John Doe',
      slug: 'john-doe-memorial'
    }

    const response = await fetch('http://localhost/wp-json/tributestream/v1/tribute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data).toEqual(testData)
  })
})
 
