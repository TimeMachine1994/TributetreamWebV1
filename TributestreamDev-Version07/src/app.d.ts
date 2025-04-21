// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: number;
				username: string;
				email: string;
				provider: string;
				confirmed: boolean;
				blocked: boolean;
				createdAt: string;
				updatedAt: string;
			};
			token?: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// User authentication types
interface StrapiLoginResponse {
	jwt: string;
	user: {
		id: number;
		username: string;
		email: string;
		provider: string;
		confirmed: boolean;
		blocked: boolean;
		createdAt: string;
		updatedAt: string;
	};
}

interface StrapiLoginCredentials {
	identifier: string;
	password: string;
}

export {};
