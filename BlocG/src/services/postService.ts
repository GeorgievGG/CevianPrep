import { IPost } from "../interfaces/IPost";
import { IPostModel } from "../interfaces/IPostModel";
import { IUserModel } from "../interfaces/IUserModel";
import { AuthenticationPayload } from "../models/authenticationPayload";
import { ContentResponse } from "../models/contentResponse";
import { Post } from "../models/post";
import { PostInput } from "../models/postInput";
import { getUserByUsername } from "../data/userRepository";

const internalServerErrorMessage: string = 'Internal server error';
const alreadyExistsErrorMessage: string = 'Post already exists';
const requiredErrorMessage: string = 'is required!';

export function addPost(user: AuthenticationPayload, input: PostInput) {
    return new Promise<ContentResponse>(function (resolve, reject) {
        validateCreated(user, input)
            .then((user: AuthenticationPayload) => validateContent(user, input))
            .then((user: AuthenticationPayload) => validateTitle(user, input))
            .then((user: AuthenticationPayload) => createPost(user, input))
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

function validateCreated(user: AuthenticationPayload, input: PostInput) {
    return new Promise<AuthenticationPayload>(function (resolve, reject) {
        if (!input.created) {
            reject(new ContentResponse(400, `Created date ${requiredErrorMessage}`));
        }
        resolve(user);
    });
}

function validateContent(user: AuthenticationPayload, input: PostInput) {
    return new Promise<AuthenticationPayload>(function (resolve, reject) {
        if (!input.content) {
            reject(new ContentResponse(400, `Content ${requiredErrorMessage}`));
        }
        resolve(user);
    });
}

function validateTitle(user: AuthenticationPayload, input: PostInput) {
    return new Promise<AuthenticationPayload>(function (resolve, reject) {
        if (!input.title) {
            reject(new ContentResponse(400, `Title ${requiredErrorMessage}`));
        }
        resolve(user);
    });
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

        Post.find({ created: post.created, user: post.user }, function (err: Error, posts: IPostModel[]) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, internalServerErrorMessage));
            }
            else if (posts.length != 0) {
                reject(new ContentResponse(409, alreadyExistsErrorMessage));
            }
    
            resolve(post);
        });
    })
}

function savePost(post: IPost) {
    return new Promise<ContentResponse>(function (resolve, reject) {
        new Post(post).save(function (err: Error, post: IPost) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, `Post \'${post.content}\' couldn't be added!`));
            }
            else {
                console.log('Post created: ' + post);
                resolve(new ContentResponse(200, `Post \'${post.content}\' successfully added!`));
            }
        });
    })
}

function getPosts(users: IUserModel[]) {
    return new Promise<IPost[]>(function (resolve, reject) {
        Post.find(choosePostSearchCondition(users), function (err: Error, posts: IPostModel[]) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, internalServerErrorMessage));
            }
            var simplePosts: IPost[] = posts.map(post => <IPost>{
                created: post.created,
                content: post.content,
                title: post.title,
                user: (<IUserModel>users.find(byId(post))).username
            });

            resolve(simplePosts);
        });
    })

    function choosePostSearchCondition(users: IUserModel[]): any {
        const isFilteredByUsername = users.length == 1;
        if (isFilteredByUsername) {
            return { user: users[0]._id }
        }

        return {};
    }

    function byId(post: IPostModel): (value: IUserModel, index: number, obj: IUserModel[]) => boolean {
        return function (element: IUserModel) {
            return element._id == post.user;
        };
    }
}