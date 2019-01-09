import { generate } from "password-hash";
import { getUserByEmail, getUserByUsername, saveUser } from "../data/userRepository";
import { IUser } from "../interfaces/IUser";
import { ContentResponse } from "../models/contentResponse";
import { RegistrationInput } from "../models/registrationInput";

const requiredErrorMessage = 'data is required!';

export function getAllUsers() {
    return getUserByUsername('all');
}

export function registerUser(input: RegistrationInput) {
    return new Promise<ContentResponse>(function (resolve, reject) {
        validateUsername(input)
            .then(() => validatePassword(input))
            .then(() => validateEmail(input))
            .then(() => createUser(input))
            .then((user: IUser) => existingUserCheck(user))
            .then((user: IUser) => existingEmailCheck(user))
            .then((user: IUser) => saveUser(user))
            .then((response: ContentResponse) => resolve(response))
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

function createUser(input: RegistrationInput) {
    return new Promise<IUser>(function (resolve) {
        var user: IUser = {
            name: input.name,
            username: input.username,
            password: generate(input.password),
            email: input.email
        };

        resolve(user);
    })
}

function existingUserCheck(user: IUser) {
    return new Promise<IUser>(function (resolve, reject) {
        getUserByUsername(user.username.toString())
            .then((users: IUser[]) => {
                if (users.length != 0) {
                    reject(new ContentResponse(409, `User \'${user.username}\' already exists!`));
                }

                resolve(user);
            })
            .catch((response: ContentResponse) => reject(response))
    })
}

function existingEmailCheck(user: IUser) {
    return new Promise<IUser>(function (resolve, reject) {
        getUserByEmail(user.email.toString())
            .then((users: IUser[]) => {
                if (users.length != 0) {
                    reject(new ContentResponse(409, `User with email \'${user.email}\' already exists!`));
                }

                resolve(user);
            });
    })
}