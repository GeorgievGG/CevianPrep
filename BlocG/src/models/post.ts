import { Schema, Model, model } from "mongoose";
import { IPostModel } from "../interfaces/IPostModel";

var PostSchema: Schema = new Schema({
    name: String,
    username: String,
    password: String,
    email: String
});

export const User: Model<IPostModel> = model<IPostModel>("Post", PostSchema);