const User = require('../model/user')

const Post = require('../model/post')

const bcrypt = require('bcryptjs')

const validator = require('validator')

const jwt = require('jsonwebtoken')

module.exports = {
    createUser: async function ({ userInput }, req) {
        const errors = [];
        if(!validator.isEmail(userInput.email)) {
            errors.push({message: "Email is not valid"})
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({ message: "Password too short" })
        }
        if (validator.isEmpty(userInput.name) || !validator.isLength(userInput.name, { min: 5 })) {
            errors.push({ message: "Name too short" })
        }
        console.log(errors)
        if(errors.length > 0) {
            const error = new Error("Invalid Inputs.")
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email})
            if(existingUser) {
                const error = new Error('User already exist')
                throw error;
            }
        const hashedPw = await bcrypt.hash(userInput.password, 12)
        const user = new User ({
            email: userInput.email,
            password: hashedPw,
            name: userInput.name
        })
        const createdUser = await user.save();
        console.log(createdUser);
        return { ...createdUser._doc, _id: createdUser._id.toString() }
    },

    login: async function ({ email, password }, req) {
        const errors = [];
        if (!validator.isEmail(email)) {
            errors.push({ message: "Email is not valid" })
        }
        if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
            errors.push({ message: "Password too short" })
        }
        if (errors.length > 0) {
            const error = new Error("Invalid Inputs.")
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const user = await User.findOne({ email: email })
        if (!user) {
            const error = new Error('User does not exist')
            error.data = errors;
            error.code = 401;
            throw error;
        }
        
        const isEqual = await bcrypt.compare(password, user.password);
            if(!isEqual) {
                const error = new Error('Password do mot match')
                error.data = errors;
                error.code = 401;
                throw error;
            }
        const token = jwt.sign({email: user.email, userId: user._id }, process.env.ACCESS_TOKEN, { expiresIn: '1h'})
            console.log(token);
        return { token: token, userId: user._id.toString() }

    },

    createPost: async function ( {postInput}, req) {
        if (req.isAuth === false) {
            const error = new Error("Not authenticated.")
            error.code = 401
            throw error
        }
        const errors = [];
        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
            errors.push({ message: "Title is too short" })
        }
        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
            errors.push({ message: "Content too short" })
        }
        if (errors.length > 0) {
            const error = new Error("Invalid Inputs.")
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Invalid user.")
            error.code = 401
            throw error
        }
        const post = new Post({
            title: postInput.title,
            imageUrl: postInput.imageUrl,
            content: postInput.content,
            creator: user
        })
        const createdPost = await post.save()
        user.posts.push(createdPost._id)
        await user.save()
        return { ...createdPost._doc, postId: createdPost._id.toString(), createdAt: createdPost.createdAt.toISOString(), updatedAt: createdPost.updatedAt.toISOString()}
        
    },
    posts: async function ( { page }, req) {
        if (req.isAuth === false) {
            const error = new Error("Not authenticated.")
            error.code = 401
            throw error
        }

        if(!page) {
            page = 1;
        }
        const perPage = 2
        const totalPosts = await Post.find().countDocuments()
        const posts = await Post.find()
                        .sort({ createdAt: -1 })
                        .skip((page - 1) * perPage)
                        .limit(perPage)
                        .populate('creator')
            if (!posts) {
                const error = new Error("Invalid Id to fetch posts.")
                error.code = 401
                throw error
            }
        // const returnPost =  { ...posts._doc }
        // const user = await User.findById(returnPost.creator._id)
        // returnPost.creator = user
        return { posts: posts.map( p => {
            return { ...p._doc, postId: p._id.toString(), createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString()}
        }), totalPosts: totalPosts }
    },
    post: async function({ id }, req) {
        if (req.isAuth === false) {
            const error = new Error("Not authenticated.")
            error.code = 401
            throw error
        }
        const post = await Post.findById(id)
                        .populate('creator')
        if (!post) {
            const error = new Error("No post found.")
            error.code = 401
            throw error
        }
        return {
            ...post._doc,
            _id: post._id.toString(), 
            createdAt: post.createdAt.toISOString(), 
            updatedAt: post.updatedAt.toISOString()
        }
    }
}

