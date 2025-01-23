export interface User {
    id?: string;
    username: string;
    nicename: string;
    email: string;
    isAdmin: boolean;
}

declare global {
    namespace App {
        interface Locals {
            user?: User;
        }
    }
}
