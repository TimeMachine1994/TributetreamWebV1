/// <reference types="@sveltejs/kit" />

declare global {
    namespace App {
        interface Locals {
            auth: {
                isAuthenticated: boolean;
                token: string | null;
                userId: string | null;
                role: string | null;
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
