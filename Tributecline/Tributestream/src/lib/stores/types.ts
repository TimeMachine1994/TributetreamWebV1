export interface Location {
    name: string;
    address: string;
    travelExceedsHour: boolean;
}

export interface PackageDetails {
    name: string;
    price: number;
}

export interface FuneralHome {
    name: string;
    directorName: string;
    address: string;
}

export interface MasterStore {
    orderData: {
        funeralHome: FuneralHome | null;
        selectedPackage: {
            index: number;
            details: PackageDetails;
        } | null;
        details?: {
            cartItems: Array<{ name: string; price: number }>;
            total: number;
            duration: number;
            livestreamDate: string;
            livestreamStartTime: string;
            locations: Location[];
        };
    };
}
