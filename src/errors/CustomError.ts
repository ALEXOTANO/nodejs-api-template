import { Response } from 'express';
import { GraphQLErrorExtensions } from 'graphql';
import { logError } from './error';

export class CustomError extends Error {

    context = '';
    name = 'CustomError';
    message = '';
    messageDetail = '';

    httpResponse: Response = null;
    httpResponseCode: number;
    extensions: GraphQLErrorExtensions = {};

    constructor(args: Partial<CustomError & { error: Error | CustomError }> = {}) {
        super(args.error?.message || args.message || '');
        if (args.error instanceof CustomError) {
            Object.assign(this, args.error);
        } else {
            Object.assign(this, args);
            this.extensions = {
                ...args.extensions,
                code: args.extensions?.code,
            };
        }

        this.message = `${this.context ? this.context + ' -> ' : ''}` + this.message || args.error?.message || '';
        const messageDetail = (args.error as CustomError)?.messageDetail || args.error?.message || this.message || '';

        this.messageDetail = messageDetail
            ? `${this.messageDetail ? this.messageDetail + ' -> ' : ''}${messageDetail}`
            : this.messageDetail;

        if (!(args.error instanceof CustomError)) {
            logError({
                message: this.message,
                messageDetail: this.messageDetail,
                extensions: this.extensions,
            });
        }

        if (args.httpResponse) {
            args.httpResponse.status(args.httpResponseCode).json({
                messageDetail: this.messageDetail,
                message: this.message,
            });
        }
    }
}
