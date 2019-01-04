import { Document } from "mongoose";
import { IPost } from "./IPost";

export interface IPostModel extends IPost, Document {
}