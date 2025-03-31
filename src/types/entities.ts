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
    contact_id: string;
    flow_id: string;
    agent_id: string;
    is_active: boolean;
    company_id: string;
}

export class Message extends BaseEntity {
    conversation_id: string;
    company_id: string;
    text: string;
    type: string; //'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact' | 'sticker' | 'template';
    sender: MessageSenderType;
}

export type MessageSenderType = 'customer' | 'human' | 'ai';

export class MessageContent {
    type?: 'human' | 'ai';
    content?: string;
    tool_calls?: [];
    additional_kwargs?: {};
    response_metadata?: {};
    invalid_tool_calls?: [];
}

export class User extends BaseEntity {
    company_id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    is_active: boolean;
}
export class Flow extends BaseEntity {
    company_id: string;
    type: 'whatsapp' | 'email' | 'messenger' | 'web' | 'ig' | 'sms';
    platform_id: string;
    email: string;
    phone: string;
    is_active: boolean;
}
export class Agent extends BaseEntity {
    company_id: string;
    flow_id: string;
    name: string;
    job_description: string;
    knowledge_base: string;
    tasks: string[];
    rules: string[];
}

export enum UserRole {
    admin = 'admin',
    user = 'user'
}
