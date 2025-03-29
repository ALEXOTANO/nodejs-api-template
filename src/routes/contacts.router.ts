import { Router } from 'express';
import { ContactsController } from '../controllers/contacts.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';
import { AuthMiddlewares } from '../middlewares/auth.middleware';

export const ContactsRouter = (
    contactsController: ContactsController,
    authMiddlewares: ReturnType<typeof AuthMiddlewares>
) => {
    const contacts = Router();
    contacts.get('/v1/contacts', [authMiddlewares.checkToken], asyncErrorHandler(contactsController.getAll));
    return contacts;
};
