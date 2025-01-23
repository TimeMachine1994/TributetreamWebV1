export interface UserMeta {
    memorial_form_data?: string;
    [key: string]: string | undefined;
}

export interface PageData {
    appId: string;
    locationId: string;
    userMeta: UserMeta;
}
