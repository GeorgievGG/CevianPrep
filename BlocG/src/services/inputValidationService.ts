import { PostInput } from "../models/postInput";
import { ContentResponse } from "../models/contentResponse";
import { RegistrationInput } from "../models/registrationInput";

const requiredErrorMessage: string = 'is required!';

export function validateRegistrationInput(input: RegistrationInput) {
    return new Promise<void>(function (resolve, reject) {
        validateUsername(input)
            .then(() => validatePassword(input))
            .then(() => validateEmail(input))
            .then(() => resolve())
            .catch((response: ContentResponse) => reject(response));
    })
}

export function validatePostInput(input: PostInput) {
    return new Promise<void>(function (resolve, reject) {
        validateCreated(input)
            .then(() => validateContent(input))
            .then(() => validateTitle(input))
            .then(() => resolve())
            .catch((response: ContentResponse) => reject(response));
    })
}

function validateUsername(input: RegistrationInput) {
    return new Promise<void>(function (resolve, reject) {
        if (!input.username) {
            reject(new ContentResponse(400, `Username ${requiredErrorMessage}`));
        }
        resolve();
    });
}

function validatePassword(input: RegistrationInput) {
    return new Promise<void>(function (resolve, reject) {
        if (!input.password) {
            reject(new ContentResponse(400, `Password ${requiredErrorMessage}`));
        }
        resolve();
    });
}

function validateEmail(input: RegistrationInput) {
    return new Promise<void>(function (resolve, reject) {
        if (!input.email) {
            reject(new ContentResponse(400, `Email ${requiredErrorMessage}`));
        }
        resolve();
    });
}

function validateCreated(input: PostInput) {
    return new Promise<void>(function (resolve, reject) {
        if (!input.created) {
            reject(new ContentResponse(400, `Created date ${requiredErrorMessage}`));
        }
        resolve();
    });
}

function validateContent(input: PostInput) {
    return new Promise<void>(function (resolve, reject) {
        if (!input.content) {
            reject(new ContentResponse(400, `Content ${requiredErrorMessage}`));
        }
        resolve();
    });
}

function validateTitle(input: PostInput) {
    return new Promise<void>(function (resolve, reject) {
        if (!input.title) {
            reject(new ContentResponse(400, `Title ${requiredErrorMessage}`));
        }
        resolve();
    });
}