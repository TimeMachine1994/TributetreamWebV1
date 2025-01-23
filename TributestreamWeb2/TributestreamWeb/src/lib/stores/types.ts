export interface UserData {
    appId?: string;
    locationId?: string;
    userMeta: {
        memorial_form_data?: string;
        [key: string]: string | undefined;
    };
    lastUpdated: number;
}

export interface OrderData {
    orderId?: string;
    status?: string;
    details?: any; // Replace with specific order type when available
    lastUpdated: number;
}

export interface MasterStore {
    userData: UserData;
    orderData: OrderData;
    initialized: boolean;
}

export type StoreUpdate = Partial<Omit<UserData, 'lastUpdated'>> | Partial<Omit<OrderData, 'lastUpdated'>>;
