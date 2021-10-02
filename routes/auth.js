const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * @description register route
 */
router.post("/register", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        
        const userdata = {
            username: req.body.username,
            email: req.body.email.toLowerCase(),
            password: hashedPass,
        }

        const user = await User.create(userdata);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({"message": "Something went wrong!"});
    }
});

/**
 * @description login user
 */
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user && (await bcrypt.compare(req.body.password, user.password))) {            
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
            res.header("auth-token", token).send(token);
        } else {
            res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({"message": "Something went wrong!"});
    }
});

module.exports = router;