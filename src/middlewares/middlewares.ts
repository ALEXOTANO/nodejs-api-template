import { Services } from '../services/services';
import { AuthMiddlewares } from './auth.middleware';
import { filesUpload } from './fileupload.middleware';

export const Middlewares = (services: typeof Services) => ({
    filesUpload,
    authMiddlewares: AuthMiddlewares(services.firebaseService),
});
