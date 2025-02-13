export interface RegisterData {
    username: string;
    email: string;
    password: string;
    meta?: Record<string, any>;
}

export interface UserRole {
    user_id: number;
    roles: string[];
}

export interface LoginResponse {
    token: string;
    user_email: string;
    user_nicename: string;
    user_display_name: string;
    user_id: number;
    roles: string[];
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

export interface Tribute {
    id: number;
    title: string;
    content: string;
    status: 'draft' | 'published';
    author: number;
    created_at: string;
    updated_at: string;
    meta: Record<string, any>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

export interface UserMeta {
    meta_key: string;
    meta_value: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}
