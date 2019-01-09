export class PostInput {
    created: Date;
    content: string;
    title: string;

    constructor(created: Date, content: string, title: string) {
        this.created = created;
        this.content = content;
        this.title = title;
    }
}