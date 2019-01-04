import { Document } from "mongoose";
import { IUser } from "./IUser";

export interface IPostModel extends IUser, Document {
}