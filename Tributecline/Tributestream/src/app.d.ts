declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token?: string;
			userId?: string;
			isAuthenticated: boolean;
		}
		// interface PageData {}
		// interface Platform {}
		interface PublicEnv {
			PUBLIC_WORDPRESS_URL: string;
		}
	}
}

export {};
