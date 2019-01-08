export class AuthenticationPayload {
    userId: string;
    username: String;

    constructor(_id: string, username: string) {
        this.userId = _id;
        this.username = username;
    }
}