import { IUser } from "../interfaces/IUser";
import { IUserModel } from "../interfaces/IUserModel";
import { ContentResponse } from "../models/contentResponse";
import { User } from "../models/user";

const internalServerErrorMessage = 'Internal server error';

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

export function getUserByEmail(email: string) {
    return new Promise<IUserModel[]>(function (resolve, reject) {
        User.find({ email: email }, function (err: Error, users: IUserModel[]) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, internalServerErrorMessage));
            }

            resolve(users);
        });
    })
}

export function saveUser(user: IUser) {
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

function chooseUserSearchCondition(username: string): any {
    const isFilteredByUsername = username != 'all';
    if (isFilteredByUsername) {
        return { username: username };
    }

    return { };
}