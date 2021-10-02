const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { verifyJWT } = require("../middleware/verifyToken");
const Post = require("../models/Post");
const { Promise } = require("mongoose");

const router = express.Router();

/**
 * @description create Post
 */
router.post("/create", verifyJWT, async (req, res) => {
    Post.create({
        userId: req.user._id,
        desc: req.body.desc,
        image: req.body.image
    })
    .then((post) => {
        res.status(201).json(post);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({"error": "Server Error!"});
    });
});

/**
 * @description update post
 */
router.put("/:id", verifyJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post){
            res.status(404).json("Post not found!");
        } 

        if (post.userId !== req.user._id) {
            res.status(403).json("Unauthorized access");
        }
        const up_post = await post.updateOne({ $set: req.body });
        res.status(200).json("Post updated");
    } catch (err) {
        console.log(err);
        res.status(500).json("Something went wrong!");
    }
});

/**
 * @description delete post
 */
router.delete("/:id", verifyJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post){
            res.status(404).json("Post not found!");
        } 

        if (post.userId !== req.user._id) {
            res.status(403).json("Unauthorized access");
        }
        const dltd_post = await post.delete();
        res.status(200).json("Post deleted!");
    } catch (err) {
        console.log(err);
        res.status(500).json("Something went wrong!");
    }
});

/**
 * @description like/dislike a post
 */
router.put("/:id/like", verifyJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post){
            res.status(404).json("Post not found!");
        } 

        console.log(post);
        if (post.likes.includes(req.user._id)){
            await post.updateOne({ $pull: {likes: req.user._id} });
            res.status(200).json("Post disliked");
        } else {
            await post.updateOne({ $push: {likes: req.user._id} });
            res.status(200).json("Post liked");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json("Something went wrong!");
    }
});


/**
 * @description get user feed
 */
router.get("/feed", verifyJWT, async (req, res) => {
    try {
        const currUser = await User.findById(req.user._id);

        const friendPosts = await Promise.all(
            currUser.followings.map((friendId) => {
                return Post.find({userId: friendId});
            })
        )
        res.status(200).json(friendPosts);
    } catch (err) {
        console.log(err);
        res.status(500).json("Something went wrong!");
    }
});

/**
 * @description get a post
 */
 router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findOne({_id: req.params.id});
        res.status(200).json(post);
    } catch (err) {
        console.log(err);
        res.status(500).json("Something went wrong!");
    }
});

module.exports = router;