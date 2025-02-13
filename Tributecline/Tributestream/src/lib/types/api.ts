export interface RegisterData {
    username: string;
    email: string;
    password?: string; // Optional since we'll generate it
    firstName: string;
    lastName: string;
    meta?: Record<string, any>; // Optional metadata
}

export interface MemorialFormData {
    director: {
        firstName: string;
        lastName: string;
    };
    familyMember: {
        firstName: string;
        lastName: string;
        dob: string;
    };
    deceased: {
        firstName: string;
        lastName: string;
        dob: string;
        dop: string;
    };
    contact: {
        email: string;
        phone: string;
    };
    memorial: {
        locationName: string;
        locationAddress: string;
        time: string;
        date: string;
    };
}
