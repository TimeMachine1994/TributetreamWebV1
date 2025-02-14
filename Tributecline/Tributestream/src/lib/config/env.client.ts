/**
 * Client-side environment configuration
 * Provides type-safe access to public environment variables
 */

/**
 * Client environment configuration type
 */
interface ClientEnvConfig {
  // WordPress API configuration
  publicWordpressUrl: string;
  wpApiNamespace: string;
}

/**
 * Validates that required client environment variables are present
 * @throws Error if any required variables are missing
 */
function validateClientEnv(): void {
  const required = [
    'VITE_WORDPRESS_URL',
    'VITE_WP_API_NAMESPACE'
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n` +
      'Please ensure these variables are defined in your .env file.'
    );
  }
}

/**
 * Creates a validated client environment configuration object
 * @returns ClientEnvConfig object with all environment variables
 */
function createClientEnvConfig(): ClientEnvConfig {
  // Validate environment variables before creating config
  validateClientEnv();

  return {
    publicWordpressUrl: import.meta.env.VITE_WORDPRESS_URL,
    wpApiNamespace: import.meta.env.VITE_WP_API_NAMESPACE
  };
}

// Create and export the client environment configuration
export const clientConfig = createClientEnvConfig();

// Export individual environment variables for convenience
export const {
  publicWordpressUrl,
  wpApiNamespace
} = clientConfig;