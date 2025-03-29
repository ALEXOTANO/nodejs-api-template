export class BaseEntity {
    id: string;
    created_at: Date;
    deleted_at?: Date;
    updated_at: Date;
}

export class Company extends BaseEntity {
    name: string;
    plan: string;
    expires_at: Date;
}

export class Contact extends BaseEntity {
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

export class Conversation extends BaseEntity {
    session_id: string;
    message: string;
    contact_id: string;
    company_id: string;
}

export class User extends BaseEntity {
    company_id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
}

export enum UserRole {
    admin = 'admin',
    user = 'user'
}
