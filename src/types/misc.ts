import { Request } from 'express';
import { Timestamp } from 'firebase-admin/firestore';

export interface RequestFirebaseToken extends Request {
    firebaseId: string;
}

export interface RequestUserData extends Request {
    userData: UserData;
}
export interface GraphQLRequestContext {
    userData: UserData;
}
export interface UserData {
    userId: string;
    role: string;
    companyId: string;
}

export type TimestampOrString = Timestamp | string | Date;

export enum plans {
    free = 'free',
    standard = 'standard',
    premium = 'premium',
    professional = 'professional',
}
