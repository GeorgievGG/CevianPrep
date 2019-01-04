import { Document, Schema, Model, model } from "mongoose";
import { IUser } from "../interfaces/IUser";

export interface IUserModel extends IUser, Document {
}

var UserSchema: Schema = new Schema({
    name: String,
    username: String,
    password: String,
    email: String
});

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);