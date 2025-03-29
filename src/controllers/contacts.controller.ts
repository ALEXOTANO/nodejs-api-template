import { Request, Response } from 'express';
import { ContactUsecase } from '../usecases/contact.usecase';

export class ContactsController {
    constructor(private contactUsecase: ContactUsecase) { }

    getAll = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const contacts = await this.contactUsecase.getAll();
            return res.status(200).json(contacts);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};

