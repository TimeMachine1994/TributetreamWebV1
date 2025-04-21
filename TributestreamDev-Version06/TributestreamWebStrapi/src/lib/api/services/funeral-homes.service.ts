import strapiClient from '$lib/api/strapi-client';
import type { 
  StrapiResponse, 
  StrapiCollection,
  FuneralHomeAttributes, 
  FuneralHomeInput,
  FuneralHome 
} from '$lib/types/strapi.types';

/**
 * Service for interacting with the Funeral Homes API
 */
class FuneralHomesService {
  private basePath = 'funeral-homes';
  
  /**
   * Get all funeral homes with pagination
   */
  async getAll(page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<FuneralHomeAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Get funeral homes by director (user) ID
   */
  async getByDirector(directorId: number, page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<FuneralHomeAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'filters[director][id][$eq]': directorId.toString(),
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Get a funeral home by ID
   */
  async getById(id: number): Promise<StrapiResponse<FuneralHome>> {
    return strapiClient.get(`${this.basePath}/${id}`, {
      'populate': '*'
    });
  }
  
  /**
   * Create a new funeral home
   */
  async create(data: FuneralHomeInput): Promise<StrapiResponse<FuneralHome>> {
    return strapiClient.post(`${this.basePath}`, { data });
  }
  
  /**
   * Update a funeral home
   */
  async update(id: number, data: Partial<FuneralHomeInput>): Promise<StrapiResponse<FuneralHome>> {
    return strapiClient.put(`${this.basePath}/${id}`, { data });
  }
  
  /**
   * Delete a funeral home
   */
  async delete(id: number): Promise<StrapiResponse<FuneralHome>> {
    return strapiClient.delete(`${this.basePath}/${id}`);
  }
  
  /**
   * Get funeral home details with tributes
   */
  async getWithTributes(funeralHomeId: number): Promise<StrapiResponse<FuneralHome>> {
    return strapiClient.get(`${this.basePath}/${funeralHomeId}`, {
      'populate': 'tributes,director'
    });
  }
}

const funeralHomesService = new FuneralHomesService();
export default funeralHomesService;