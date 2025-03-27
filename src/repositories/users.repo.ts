import { User } from '../types/autogen/types';

export class UserRepo {
    private static contacts: User[] = [
        {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
        },
        {
            id: '2',
            firstName: 'Jane',
            lastName: 'Doe',
        },
    ];

    async get(): Promise<User[]> {
        return UserRepo.contacts;
    }

    async getById(id: string): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = UserRepo.contacts[id];
                if (user) {
                    resolve(user);
                } else {
                    reject(new Error('User not found'));
                }
            }, 1000);
        });
    }

    async create(contact: Partial<User>): Promise<User> {
        const newContact = { ...contact, id: UserRepo.contacts.length + 1 } as unknown as User;
        UserRepo.contacts.push(newContact);

        return newContact;
    }
}
