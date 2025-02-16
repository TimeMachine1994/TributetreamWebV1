/// <reference types="@sveltejs/kit" />

declare global {
    namespace App {
        interface Locals {
            auth: {
                isAuthenticated: boolean;
                token: string | null;
                userId: string | null;
                role: string | null;   // Primary role (for backwards compatibility)
                roles: string[];       // All user roles
                calculatorStatus: {
                    completed: boolean;
                } | null;
            };
        }
        // interface Platform {}
        // interface Session {}
        // interface Stuff {}
    }
}

export {};
