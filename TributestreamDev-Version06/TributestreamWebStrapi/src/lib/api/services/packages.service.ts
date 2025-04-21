import strapiClient from '$lib/api/strapi-client';
import type { 
  StrapiResponse, 
  StrapiCollection,
  PackageAttributes, 
  PackageInput,
  Package 
} from '$lib/types/strapi.types';

/**
 * Service for interacting with the Packages API
 */
class PackagesService {
  private basePath = 'packages';
  
  /**
   * Get all packages with pagination
   */
  async getAll(page = 1, pageSize = 10): Promise<StrapiResponse<StrapiCollection<PackageAttributes>>> {
    return strapiClient.get(`${this.basePath}`, {
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*'
    });
  }
  
  /**
   * Get a package by ID
   */
  async getById(id: number): Promise<StrapiResponse<Package>> {
    return strapiClient.get(`${this.basePath}/${id}`, {
      'populate': '*'
    });
  }
  
  /**
   * Create a new package
   */
  async create(data: PackageInput): Promise<StrapiResponse<Package>> {
    return strapiClient.post(`${this.basePath}`, { data });
  }
  
  /**
   * Update a package
   */
  async update(id: number, data: Partial<PackageInput>): Promise<StrapiResponse<Package>> {
    return strapiClient.put(`${this.basePath}/${id}`, { data });
  }
  
  /**
   * Delete a package
   */
  async delete(id: number): Promise<StrapiResponse<Package>> {
    return strapiClient.delete(`${this.basePath}/${id}`);
  }
  
  /**
   * Get package details with tributes
   */
  async getWithTributes(packageId: number): Promise<StrapiResponse<Package>> {
    return strapiClient.get(`${this.basePath}/${packageId}`, {
      'populate': 'tributes'
    });
  }
}

const packagesService = new PackagesService();
export default packagesService;