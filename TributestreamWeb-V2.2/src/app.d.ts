declare global {
    namespace App {
        interface Locals {
            authenticated: boolean;
            token: string | undefined;
            userId: string | undefined;
        }
        // interface PageData {}
        // interface Error {}
        // interface Platform {}
    }
}

export {};
