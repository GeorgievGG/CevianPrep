import { Schema, Model, model } from "mongoose";
import { IUserModel } from "../interfaces/IUserModel";

var UserSchema: Schema = new Schema({
    name: String,
    username: String,
    password: String,
    email: String
});

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);