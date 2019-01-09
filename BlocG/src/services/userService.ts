import { generate } from "password-hash";
import { IUser } from "../interfaces/IUser";
import { IUserModel } from "../interfaces/IUserModel";
import { ContentResponse } from "../models/contentResponse";
import { RegistrationInput } from "../models/registrationInput";
import { User } from "../models/user";

const internalServerErrorMessage = 'Internal server error';
const requiredErrorMessage = 'data is required!';

export function getAllUsers() {
    return getUserByUsername('all');
}

export function getUserByUsername(username: string) {
    return new Promise<IUserModel[]>(function (resolve, reject) {
        User.find(chooseUserSearchCondition(username), function (err: Error, users: IUserModel[]) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, internalServerErrorMessage));
            }

            resolve(users);
        });
    })
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

function chooseUserSearchCondition(username: string): any {
    const isFilteredByUsername = username != 'all';
    if (isFilteredByUsername) {
        return { username: username };
    }

    return { };
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
        User.find({ username: user.username }, function (err: Error, users: IUserModel[]) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, internalServerErrorMessage));
            }
            else if (users.length != 0) {
                reject(new ContentResponse(409, `User \'${user.username}\' already exists!`));
            }

            resolve(user);
        });
    })
}

function existingEmailCheck(user: IUser) {
    return new Promise<IUser>(function (resolve, reject) {
        User.find({ email: user.email }, function (err: Error, users: IUserModel[]) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, internalServerErrorMessage));
            }
            else if (users.length != 0) {
                reject(new ContentResponse(409, `User with email \'${user.email}\' already exists!`));
            }

            resolve(user);
        });
    })
}

function saveUser(user: IUser) {
    return new Promise<ContentResponse>(function (resolve, reject) {
        new User(user).save(function (err: Error, user: IUser) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, `User \'${user.username}\' couldn't be registered!`));
            }
            else {
                console.log('User created: ' + user);
                resolve(new ContentResponse(200, `User \'${user.username}\' successfully registered!`));
            }
        });
    })
}