import { auth } from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import { logError } from '../errors/error';
import { FirebaseService } from '../services/firebase.service';

export const AuthRepo = (firebase: typeof FirebaseService) => {
    const generateToken = (userId: string, userType: string): Promise<string> => {
        const dataToStore = {
            userId,
            userRole: userType,
            iat: Math.floor(Date.now() / 1000) - 1,
            userType,
        };

        return new Promise((res, rej) => {
            jwt.sign(dataToStore, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 30 }, (err, token) => {
                if (err) rej(err);
                res(token);
            });
        });
    };

    const getByFirebaseId = async (firebaseId: string): Promise<Partial<auth.UserRecord>> => {
        try {
            const userRecord = await firebase.appAuth.getUser(firebaseId);
            if (!userRecord) {
                throw new Error('User not found,');
            }
            return userRecord;
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    return {
        generateToken,
        getByFirebaseId,
    };
};
