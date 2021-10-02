const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { verifyJWT } = require("../middleware/verifyToken");
const Post = require("../models/Post");

const router = express.Router();

// Update User
router.put("/:id", verifyJWT, async (req, res) => {
    if (req.user._id == req.params.id) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch(err) {
                res.status(500).json("Server Error");
            }
        }

        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            });

            res.status(200).json("Account details updated!");
        } catch(err) {
            res.status(500).json("Something went wrong");
        }
    } else {
        res.status(403).json("Unauthorized access");
    }
});

// Delete User
router.delete("/:id", verifyJWT, async (req, res) => {
    if (req.user._id == req.params.id) {
        try {
            const user = await User.findByIdAndDelete(req.user.id);
            res.status(200).json("Account deleted!");
        } catch(err) {
            res.status(500).json("Server Error");
        }
    } else {
        res.status(403).json("Unauthorized access");
    }
})

// Get User
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                followers: user.followers,
                followings: user.followings,
                posts: await Post.find({userId: user._id})
            });
        } else {
            res.status(404).json("No such user!");
        }
    } catch(err) {
        res.status(500).json("Server Error");
    }
})

// Follow User
router.put("/:id/follow", verifyJWT, async (req, res) => {
    if (req.user._id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currUser = await User.findById(req.user._id);

            if (user.followers.includes(currUser._id)) {
                res.status(403).json("You're already following this User!");
            } else {
                await user.updateOne({$push: {followers: currUser._id}});
                await currUser.updateOne({$push: {followings: user._id}});
                
                res.status(200).json("Followed!");
            }

        } catch(err) {
            res.status(500).json("Server Error");
        }
    } else {
        res.status(403).json("Can't follow yourself!");
    }
});

// Unfollow User
router.put("/:id/unfollow", verifyJWT, async (req, res) => {
    if (req.user._id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currUser = await User.findById(req.user._id);

            if (user.followers.includes(currUser._id)) {
                await user.updateOne({$pull: {followers: currUser._id}});
                await currUser.updateOne({$pull: {followings: user._id}});
                
                res.status(200).json("Unfollowed!");
            } else {
                res.status(403).json("You're not following this User!");
            }

        } catch(err) {
            res.status(500).json("Server Error");
        }
    } else {
        res.status(403).json("Can't unfollow yourself!");
    }
});

module.exports = router;