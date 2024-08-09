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
    userPermission: string[];
    userRole: string;
    userType: string;
}

export type TimestampOrString = Timestamp | string | Date;
