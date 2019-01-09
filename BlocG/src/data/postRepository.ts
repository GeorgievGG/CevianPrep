import { Post } from "../models/post";
import { ContentResponse } from "../models/contentResponse";
import { IPost } from "../interfaces/IPost";
import { IPostModel } from "../interfaces/IPostModel";
import { IUserModel } from "../interfaces/IUserModel";

const internalServerErrorMessage = 'Internal server error';

export function savePost(post: IPost) {
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

export function getPostsByAuthorAndDate(userId: string, createdDate: Date ) {
    return new Promise<IPost[]>(function (resolve, reject) {
        Post.find({ created: createdDate, user: userId }, function (err: Error, posts: IPost[]) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, internalServerErrorMessage));
            }
    
            resolve(posts);
        });
    })
}

export function getPostByAuthorAndDate(userId: string, createdDate: Date ) {
    return new Promise<IPost[]>(function (resolve, reject) {
        Post.find({ created: createdDate, user: userId }, function (err: Error, posts: IPost[]) {
            if (err) {
                console.log(err);
                reject(new ContentResponse(500, internalServerErrorMessage));
            }
    
            resolve(posts);
        });
    })
}

export function getPosts(users: IUserModel[]) {
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
