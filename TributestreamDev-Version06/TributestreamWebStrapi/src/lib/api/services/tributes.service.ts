import strapiClient from '$lib/api/strapi-client';
import type { 
  StrapiResponse, 
  StrapiCollection,
  TributeAttributes, 
  TributeInput,
  Tribute 
} from '$lib/types/strapi.types';

/**
 * Service for interacting with the Tributes API
 */
class TributesService {
  private basePath = 'tributes';
  
  /**
   * Get all tributes with pagination
   */
  async getAll(page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<TributeAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Get tributes by user ID
   */
  async getByUser(userId: number, page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<TributeAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'filters[owner][id][$eq]': userId.toString(),
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Get tributes by funeral home ID
   */
  async getByFuneralHome(funeralHomeId: number, page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<TributeAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'filters[funeralHome][id][$eq]': funeralHomeId.toString(),
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Get a tribute by ID
   */
  async getById(id: number): Promise<StrapiResponse<Tribute>> {
    return strapiClient.get(`${this.basePath}/${id}`, {
      'populate': '*'
    });
  }
  
  /**
   * Get tributes by package ID
   */
  async getByPackage(packageId: number, page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<TributeAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'filters[package][id][$eq]': packageId.toString(),
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Create a new tribute
   */
  async create(data: TributeInput): Promise<StrapiResponse<Tribute>> {
    return strapiClient.post(`${this.basePath}`, { data });
  }
  
  /**
   * Update a tribute
   */
  async update(id: number, data: Partial<TributeInput>): Promise<StrapiResponse<Tribute>> {
    return strapiClient.put(`${this.basePath}/${id}`, { data });
  }
  
  /**
   * Delete a tribute
   */
  async delete(id: number): Promise<StrapiResponse<Tribute>> {
    return strapiClient.delete(`${this.basePath}/${id}`);
  }
}

const tributesService = new TributesService();
export default tributesService;