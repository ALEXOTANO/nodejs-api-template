export interface BaseEntity {
    id: string;
    created_at: Date;
    deleted_at?: Date;
    updated_at: Date;
}

export interface Company extends BaseEntity {
    name: string;
    plan: string;
    expires_at: Date;
}

export interface Contact extends BaseEntity {
    first_name: string;
    last_name: string;
    company_name?: string;
    needs?: string;
    email: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    notes?: string;
    company_id: string;
}

export interface Conversation extends BaseEntity {
    session_id: string;
    message: string;
    contact_id: string;
    company_id: string;
}
