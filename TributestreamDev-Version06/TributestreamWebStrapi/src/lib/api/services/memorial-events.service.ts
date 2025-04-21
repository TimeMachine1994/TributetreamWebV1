import strapiClient from '$lib/api/strapi-client';
import type { 
  StrapiResponse, 
  StrapiCollection,
  MemorialEventAttributes, 
  MemorialEventInput,
  MemorialEvent 
} from '$lib/types/strapi.types';

/**
 * Service for interacting with the Memorial Events API
 */
class MemorialEventsService {
  private basePath = 'memorial-events';
  
  /**
   * Get all memorial events with pagination
   */
  async getAll(page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<MemorialEventAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Get memorial events by tribute ID
   */
  async getByTribute(tributeId: number, page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<MemorialEventAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'filters[tribute][id][$eq]': tributeId.toString(),
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Get a memorial event by ID
   */
  async getById(id: number): Promise<StrapiResponse<MemorialEvent>> {
    return strapiClient.get(`${this.basePath}/${id}`, {
      'populate': '*'
    });
  }
  
  /**
   * Get a memorial event with its associated tribute
   * @param id The memorial event ID
   * @returns Promise with memorial event data and populated tribute
   */
  async getWithTribute(id: number): Promise<StrapiResponse<MemorialEvent>> {
    return strapiClient.get(`${this.basePath}/${id}`, {
      'populate': 'tribute'
    });
  }
  
  /**
   * Create a new memorial event
   */
  async create(data: MemorialEventInput): Promise<StrapiResponse<MemorialEvent>> {
    return strapiClient.post(`${this.basePath}`, { data });
  }
  
  /**
   * Update a memorial event
   */
  async update(id: number, data: Partial<MemorialEventInput>): Promise<StrapiResponse<MemorialEvent>> {
    return strapiClient.put(`${this.basePath}/${id}`, { data });
  }
  
  /**
   * Delete a memorial event
   */
  async delete(id: number): Promise<StrapiResponse<MemorialEvent>> {
    return strapiClient.delete(`${this.basePath}/${id}`);
  }
}

const memorialEventsService = new MemorialEventsService();
export default memorialEventsService;