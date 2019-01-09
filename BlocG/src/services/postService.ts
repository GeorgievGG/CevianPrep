import { getPosts, getPostsByAuthorAndDate, savePost } from "../data/postRepository";
import { getUserByUsername } from "../data/userRepository";
import { IPost } from "../interfaces/IPost";
import { IUserModel } from "../interfaces/IUserModel";
import { AuthenticationPayload } from "../models/authenticationPayload";
import { ContentResponse } from "../models/contentResponse";
import { PostInput } from "../models/postInput";
import { validatePostInput } from "./inputValidationService";

const alreadyExistsErrorMessage: string = 'Post already exists';
const requiredErrorMessage: string = 'is required!';

export function addPost(user: AuthenticationPayload, input: PostInput) {
    return new Promise<ContentResponse>(function (resolve, reject) {
        validatePostInput(input)
            .then(() => createPost(user, input))
            .then((post: IPost) => validatePost(post))
            .then((post: IPost) => savePost(post))
            .then((response: ContentResponse) => resolve(response))
            .catch((response: ContentResponse) => reject(response));
    })
}

export function getAllPosts() {
    return getPostsByUsername('all');
}

export function getPostsByUsername(username: string) {
    return new Promise<IPost[]>(function (resolve, reject) {
        getUserByUsername(username)
            .then((users: IUserModel[]) => getPosts(users))
            .then((posts: IPost[]) => resolve(posts))
            .catch((response: ContentResponse) => reject(response));
    })
}

function createPost(user: AuthenticationPayload, input: PostInput) {
    return new Promise<IPost>(function (resolve) {
        let post: IPost = {
            created: input.created,
            content: input.content,
            title: input.title,
            user: user.userId
        };

        resolve(post);
    })
}

function validatePost(post: IPost) {
    return new Promise<IPost>(function (resolve, reject) {
        if (!post.user) {
            reject(new ContentResponse(400, `Username ${requiredErrorMessage}`));
        }
        getPostsByAuthorAndDate(post.user, post.created)
            .then((posts: IPost[]) => {
                if (posts.length != 0) {
                    reject(new ContentResponse(409, alreadyExistsErrorMessage));
                }

                resolve(post);
            });
    })
}