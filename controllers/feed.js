const { validationResult } = require('express-validator')

const Post = require('../model/post');

const User = require('../model/user');

const { clearImage } = require('../helper/function');



exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const POST_PER_PAGE = 2
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
                .populate('creator')
                .skip((currentPage - 1) * POST_PER_PAGE)
                .limit(POST_PER_PAGE).exec();
    res.status(200).json({
        posts: posts,
        totalItems: totalItems
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
    
};

exports.createPost = async (req, res, next) => {
  const error = validationResult(req)
  if(!error.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422
    error.data = error.array()
    throw error
    // res.json(error.array())
  }
  if(!req.file) {
    const error = new Error("No image found.");
    error.statusCode = 422
    throw error
  }
  // Create post in db
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");
  const post = new Post({
      title: title, 
      content: content,
      imageUrl: imageUrl,
      creator: req.userId
  })
  try {
  await post.save();
  const user = await User.findById(req.userId)
    user.posts.push(post);
  await user.save()
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: {_id: user._id, name: user.name}
    })
  } catch (error) {
    if(!error.statusCode) {
        error.statusCode = 500
      }
      next(error)
  }  
};

exports.getPostById = async (req, res, next) => {
    const id = req.params.postId
    try {
      const post = await Post.findById(id) 
        if(!post) {
          const error = new Error("Could not find post.");
          error.statusCode = 422
          error.data = error.array()
          throw error
        }
        res.status(200).json({
          message: "Post fetched",
          post: post
        })
    } catch (error) {
      if (!error.statusCode) {
          error.statusCode = 500
        }
        next(error)
    }
    
}

exports.updatePost = async (req, res, next) => {
  const error = validationResult(req)
  if (!error.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422
    error.data = error.array()
    throw error
  }
  const postId = req.params.postId
  const { title, content } = req.body
  let imageUrl = req.body.image
  if(req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if(!imageUrl) {
    const error = new Error("Image is not selected.");
    error.statusCode = 422
    throw error
  }

  const post = await Post.findById(postId)
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 422
      throw error
    }
    if (post.creator.toString() !== req.userId) {
    const error = new Error("Not Authorized.");
    error.statusCode = 403
    throw error
  }
    if(imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl)
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    try {
      const result = await post.save();

      res.status(200).json({message: "Updated", post: result})
      console.log(result)
    } catch (error) {
      if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
    }

}

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId
  try {
    const post = await Post.findById(postId)
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 422
      // error.data = error.array()
      throw error
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Authorized.");
      error.statusCode = 403
      throw error
    }
    //clear image from local storage
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId)
    const user = await User.findById(req.userId)
        user.posts.pull(postId)
    await user.save()
    res.status(200).json({ message: 'Deleted Post.' })
  } catch (error) {
    if (!error.statusCode) {
        error.statusCode = 500
      }
      next(error)
  }
}
