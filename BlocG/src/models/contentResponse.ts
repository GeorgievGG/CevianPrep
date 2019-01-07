export class ContentResponse {
    statusCode: number;
    message: String;

    constructor(statusCode: number, message: string) {
        this.statusCode = statusCode;
        this.message = message;
    }
}
