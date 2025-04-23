// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { UserData } from '$lib/auth/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserData;
			jwt?: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
