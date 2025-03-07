/**
 * Interface for tribute data
 */
export interface TributeData {
    title: string;
    slug: string;
    custom_html?: string | null;
    user_name: string;
    user_email: string;
    user_phone: string;
    memorial_date?: string;
    memorial_location?: string;
    description?: string;
    created_at?: string;
    // Fields needed by the WordPress API
    user_id?: number;
    loved_one_name?: string;
    phone_number?: string;
  }
  
  /**
   * Saves a tribute to the API
   *
   * @param tributeData - The tribute data to save
   * @param token - Authentication token
   * @param fetchFn - Fetch function to use (must be event.fetch in server context)
   * @returns Promise with the API response
   */
  export async function saveTribute(
    tributeData: TributeData,
    token?: string,
    fetchFn?: typeof fetch
  ): Promise<any> {
    console.log('🔄 Saving tribute via API endpoint:', tributeData);
    
    try {
      if (!token) {
        throw new Error('Authentication token is required to create a tribute');
      }
      
      // Use provided fetch or fall back to global fetch (only works for absolute URLs)
      const fetchFunction = fetchFn || fetch;
      
      // Send the tribute data to the API endpoint
      console.log('⏱️ Sending tribute data to API endpoint at:', new Date().toISOString());
      
      const response = await fetchFunction('/api/tributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // The JWT will be extracted from cookies in the API route handler,
          // but we include it in the Authorization header as a fallback
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tributeData)
      });
      
      console.log('⏱️ Received response from API endpoint at:', new Date().toISOString());
      console.log('📊 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('❌ API call failed:', errorData);
          return {
            success: false,
            error: errorData.error || response.statusText
          };
        } catch (parseError) {
          console.error('❌ API call failed with unparseable response:', await response.text());
          return {
            success: false,
            error: `Failed to parse error response: ${response.statusText}`
          };
        }
      }
      
      try {
        const result = await response.json();
        console.log('✅ Tribute successfully created via API:', result);
        
        return {
          success: true,
          tribute: result.tribute || result // Handle both formats: {tribute: {...}} and directly {...}
        };
      } catch (parseError) {
        console.error('❌ Failed to parse API success response:', parseError);
        return {
          success: false,
          error: 'Failed to parse API response'
        };
      }
    } catch (error) {
      console.error('❌ Error saving tribute:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save tribute'
      };
    }
  }
  
  /**
   * Searches for tributes by name
   * 
   * @param searchTerm - The search term to use
   * @param page - Page number for pagination
   * @returns Promise with search results
   */
  export async function searchTributes(searchTerm: string, page = 1): Promise<any> {
    // In a real application, this would query a database
    // For now, we'll simulate some search results
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulated search results - in a real app, these would come from a database
    const mockTributes: TributeData[] = [
      { 
        title: "John Smith", 
        slug: "john-smith",
        user_name: "Sarah Smith",
        user_email: "sarah@example.com",
        user_phone: "555-123-4567"
      },
      { 
        title: "Sarah Johnson", 
        slug: "sarah-johnson",
        user_name: "Michael Johnson",
        user_email: "michael@example.com",
        user_phone: "555-987-6543"
      },
      { 
        title: "David Williams", 
        slug: "david-williams",
        user_name: "Jennifer Williams",
        user_email: "jennifer@example.com",
        user_phone: "555-567-8901"
      }
    ];
    
    // Filter tributes based on the search term
    const searchTermLower = searchTerm.toLowerCase();
    const filteredTributes = mockTributes.filter(tribute => 
      tribute.title.toLowerCase().includes(searchTermLower) ||
      tribute.slug.includes(searchTermLower)
    );
    
    return {
      success: true,
      data: {
        tributes: filteredTributes,
        total: filteredTributes.length,
        page,
        searchTerm
      }
    };
  }
  
  /**
   * Registers or logs in a user and returns a JWT token
   * 
   * @param email - User's email
   * @param name - User's name
   * @param phoneNumber - User's phone number
   * @returns Promise with the authentication token
   */
  export async function authenticateUser(email: string, name: string, phoneNumber: string): Promise<string> {
    // In a real application, this would register the user or log them in
    // For now, we'll simulate a successful login with a fake JWT
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate a random token (this is just for simulation - not a real JWT)
    const token = `simulated-jwt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    return token;
  }