// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				isAuthenticated: boolean;
				id?: number;
				email?: string;
				nicename?: string;
				displayName?: string;
			};
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
