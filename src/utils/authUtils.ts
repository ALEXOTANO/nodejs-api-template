import { CustomError } from "../errors/CustomError";
import { RequestUserData } from "../types/misc";

export const checkIfisAuthorize = (req: RequestUserData, propertyName: string, shouldBeValue: string) => {
    const { userData } = req;
    if (!userData) {
        new CustomError({
            context: 'AuthUtils:checkIfisAuthorize',
            messageDetail: 'Missing user data',
            httpResponseCode: 401,
            httpResponse: req.res,
        });

        return false;
    }

    const propertyValue = userData[propertyName];
    if (propertyValue !== shouldBeValue) {
        new CustomError({
            context: 'AuthUtils:checkIfisAuthorize',
            messageDetail: 'You are not authorized to perform this action',
            httpResponseCode: 401,
            httpResponse: req.res,
        });

        return false;
    }

    return true;
}
