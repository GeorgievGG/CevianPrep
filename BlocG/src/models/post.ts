import { Schema, Model, model } from "mongoose";
import { IPostModel } from "../interfaces/IPostModel";

var PostSchema: Schema = new Schema({
    created: Date,
    content: String,
    title: String,
    user: String
});

export const Post: Model<IPostModel> = model<IPostModel>("Post", PostSchema);