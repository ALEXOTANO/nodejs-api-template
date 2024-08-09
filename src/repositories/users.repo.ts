import { User } from '../types/autogen/types';

const contacts: User[] = [
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
export const UserRepo = () => {
    const get = async () => {
        return contacts;
    };
    const getById = async (id: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = contacts[id];
                if (user) {
                    resolve(user);
                } else {
                    reject(new Error('User not found'));
                }
            }, 1000);
        });
    };

    const create = async (contact: Partial<User>) => {
        const newContact = { ...contact, id: contacts.length + 1 } as unknown as User;
        contacts.push(newContact);

        return newContact;
    };

    return {
        get,
        getById,
        create,
    };
};
