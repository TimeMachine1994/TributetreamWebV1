import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock goto from $app/navigation
vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

describe('Slug Generation', () => {
    it('should create correct slug from name with special characters', () => {
        const name = "John-Paul O'Connor";
        const expectedSlug = 'john-paul-o-connor';
        
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
            
        expect(slug).toBe(expectedSlug);
    });
});

describe('Tribute Table API', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should make correct API call to create tribute', async () => {
        const userData = {
            user_id: '123',
            loved_one_name: 'John Doe',
            slug: 'john-doe'
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Success' })
        });

        const response = await fetch('/api/tribute-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/tribute-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        expect(data.message).toBe('Success');
    });

    it('should handle API errors correctly', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Failed to create tribute' })
        });

        const response = await fetch('/api/tribute-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        expect(response.ok).toBe(false);
        const data = await response.json();
        expect(data.message).toBe('Failed to create tribute');
    });
});
