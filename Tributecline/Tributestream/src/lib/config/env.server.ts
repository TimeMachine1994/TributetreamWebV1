import { env } from '$env/dynamic/private';

/**
 * Server-side environment configuration
 * Provides type-safe access to private environment variables
 */

/**
 * Server environment configuration type
 */
interface ServerEnvConfig {
  // WordPress API URL (private)
  wordpressUrl: string;
  
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validates that required server environment variables are present
 * @throws Error if any required variables are missing
 */
function validateServerEnv(): void {
  const required = [
    'WORDPRESS_URL',
    'NODE_ENV'
  ];

  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n` +
      'Please ensure these variables are defined in your .env file.'
    );
  }
}

/**
 * Creates a validated server environment configuration object
 * @returns ServerEnvConfig object with all environment variables
 */
function createServerEnvConfig(): ServerEnvConfig {
  // Validate environment variables before creating config
  validateServerEnv();

  return {
    wordpressUrl: env.WORDPRESS_URL,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production'
  };
}

// Create and export the server environment configuration
export const serverConfig = createServerEnvConfig();

// Export individual environment variables for convenience
export const {
  wordpressUrl,
  isDevelopment,
  isProduction
} = serverConfig;