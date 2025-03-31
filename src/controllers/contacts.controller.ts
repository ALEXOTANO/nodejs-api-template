import { Response } from 'express';
import { RequestUserData } from '../types/misc';
import { ContactUsecase } from '../usecases/contact.usecase';

export class ContactsController {
    constructor(private contactUsecase: ContactUsecase) { }

    getAll = async (req: RequestUserData, res: Response) => {
        try {
            const { companyId } = req.userData;
            const contacts = await this.contactUsecase.getAll(companyId);
            return res.status(200).json(contacts);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
    getById = async (req: RequestUserData, res: Response) => {
        try {
            const { id } = req.params;
            const { companyId } = req.userData;

            if (!id) {
                return res.status(400).json({ error: 'Contact ID is required' });
            }

            const contact = await this.contactUsecase.getById(id, companyId);

            if (!contact) {
                return res.status(404).json({ error: 'Contact not found' });
            }

            return res.status(200).json(contact);
        } catch (error) {
            console.error('Error fetching contact by ID:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

