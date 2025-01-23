export interface UserData {
    appId?: string;
    locationId?: string;
    userMeta: {
        memorial_form_data?: string;
        [key: string]: string | undefined;
    };
    lastUpdated: number;
}

export interface PackageDetails {
    name: string;
    price: number;
    type: string;
    features: string[];
}

export interface CartItem {
    name: string;
    price: number;
}

export interface Location {
    name: string;
    address: string;
    travelExceedsHour: boolean;
}

export interface OrderDetails {
    cartItems: CartItem[];
    total: number;
    duration: number;
    livestreamDate: string;
    livestreamStartTime: string;
    locations: Location[];
}

export interface OrderData {
    orderId?: string;
    status?: string;
    selectedPackage?: {
        index: number;
        details: PackageDetails;
    };
    funeralHome?: {
        name: string;
        address: string;
        directorName?: string;
    };
    memorialLocation?: {
        name: string;
        address: string;
    };
    details?: OrderDetails;
    lastUpdated: number;
}

export interface MasterStore {
    userData: UserData;
    orderData: OrderData;
    initialized: boolean;
}

export type StoreUpdate = Partial<Omit<UserData, 'lastUpdated'>> | Partial<Omit<OrderData, 'lastUpdated'>>;
