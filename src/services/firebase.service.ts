import 'dotenv/config';
import * as adminFB from 'firebase-admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { User } from '../types/autogen/types';

const serviceAccountApp = require(`../../key.json`);
if (!serviceAccountApp?.project_id) {
    throw new Error('Missing firebase service account key');
}
const app = adminFB.initializeApp({
    credential: adminFB.credential.cert(serviceAccountApp),
    storageBucket: `${serviceAccountApp.project_id}.appspot.com`,
    databaseURL: `https://${serviceAccountApp.project_id}-default-rtdb.firebaseio.com`,
});

// Database
const firestoreApp = app.firestore();
firestoreApp.settings({ ignoreUndefinedProperties: true });

// Collections
const AppDb = {
    users: firestoreApp.collection(`user`) as CollectionReference<User>,
};

// Auth
const appAuth = app.auth();

export const FirebaseService = {
    firestoreApp,
    AppDb,
    appAuth,
};
