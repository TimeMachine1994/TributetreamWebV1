/**
 * Query builder for WordPress REST API
 * 
 * This class helps build complex queries for the WordPress REST API
 * with a fluent interface for pagination, filtering, and sorting.
 */

export class QueryBuilder<T> {
  private params: Record<string, string | number | boolean | undefined> = {};
  
  /**
   * Set the page number for pagination
   * @param page Page number (1-based)
   * @returns QueryBuilder instance for chaining
   */
  page(page: number): QueryBuilder<T> {
    this.params.page = page;
    return this;
  }
  
  /**
   * Set the number of items per page
   * @param perPage Number of items per page
   * @returns QueryBuilder instance for chaining
   */
  perPage(perPage: number): QueryBuilder<T> {
    this.params.per_page = perPage;
    return this;
  }
  
  /**
   * Set the search term
   * @param term Search term
   * @returns QueryBuilder instance for chaining
   */
  search(term: string): QueryBuilder<T> {
    this.params.search = term;
    return this;
  }
  
  /**
   * Add a filter parameter
   * @param key Filter key
   * @param value Filter value
   * @returns QueryBuilder instance for chaining
   */
  filter(key: string, value: string | number | boolean | undefined): QueryBuilder<T> {
    this.params[key] = value;
    return this;
  }
  
  /**
   * Set the order by field and direction
   * @param field Field to order by
   * @param direction Order direction (asc or desc)
   * @returns QueryBuilder instance for chaining
   */
  orderBy(field: keyof T, direction: 'asc' | 'desc' = 'asc'): QueryBuilder<T> {
    this.params.orderby = field as string;
    this.params.order = direction;
    return this;
  }
  
  /**
   * Include specific fields in the response
   * @param fields Array of field names to include
   * @returns QueryBuilder instance for chaining
   */
  include(fields: (keyof T)[]): QueryBuilder<T> {
    this.params._fields = fields.join(',');
    return this;
  }
  
  /**
   * Filter by specific IDs
   * @param ids Array of IDs to include
   * @returns QueryBuilder instance for chaining
   */
  includeIds(ids: number[]): QueryBuilder<T> {
    this.params.include = ids.join(',');
    return this;
  }
  
  /**
   * Exclude specific IDs
   * @param ids Array of IDs to exclude
   * @returns QueryBuilder instance for chaining
   */
  excludeIds(ids: number[]): QueryBuilder<T> {
    this.params.exclude = ids.join(',');
    return this;
  }
  
  /**
   * Filter by author ID
   * @param authorId Author ID
   * @returns QueryBuilder instance for chaining
   */
  byAuthor(authorId: number): QueryBuilder<T> {
    this.params.author = authorId;
    return this;
  }
  
  /**
   * Filter by parent ID
   * @param parentId Parent ID
   * @returns QueryBuilder instance for chaining
   */
  byParent(parentId: number): QueryBuilder<T> {
    this.params.parent = parentId;
    return this;
  }
  
  /**
   * Filter by status
   * @param status Status (publish, draft, etc.)
   * @returns QueryBuilder instance for chaining
   */
  byStatus(status: string): QueryBuilder<T> {
    this.params.status = status;
    return this;
  }
  
  /**
   * Filter by date range
   * @param after Date after (ISO 8601 format)
   * @param before Date before (ISO 8601 format)
   * @returns QueryBuilder instance for chaining
   */
  byDateRange(after?: string, before?: string): QueryBuilder<T> {
    if (after) {
      this.params.after = after;
    }
    
    if (before) {
      this.params.before = before;
    }
    
    return this;
  }
  
  /**
   * Get the built parameters
   * @returns Parameters object
   */
  getParams(): Record<string, string | number | boolean | undefined> {
    return { ...this.params };
  }
}

/**
 * Create a new query builder instance
 * @returns QueryBuilder instance
 */
export function createQuery<T>(): QueryBuilder<T> {
  return new QueryBuilder<T>();
}