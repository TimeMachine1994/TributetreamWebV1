export interface RegisterData {
    username: string;
    email: string;
    password: string;
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
