const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input PostInput {
        title: String!
        imageUrl: String!
        content: String!
    }

    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }

    input LoginInputData {
        email: String!
        password: String!
    }

    type AuthData {
        token: String!
        userId: String!
    }
    
    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int!): PostData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInput): Post!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);