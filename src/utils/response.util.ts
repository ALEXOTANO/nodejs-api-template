export class CustomResponse {
    message: string = ''

    code: string = ''

    data: any = {}

    constructor(message: string, code?: string, data?: any) {
        this.message = message || this.message
        this.code = code || this.code
        this.data = data || this.data

    }

    static dataOnly(data: any) {
        return data || {}
    }

}