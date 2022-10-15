const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validateUserInfo = require("../validation/registerValidation");
const requireAuth = require("../middleware/permissions");

// @route   GET /api/auth/test
// @desc    Test the auth route
// @access  Public
router.get("/test", (req, res) => {
    res.send("Auth route working...");
});

// @route   POST /api/auth/register
// @desc    Create a new User
// @access  Public
router.post("/register", async (req, res) => {
    try {
        // validate user:
        const { errors, isValid } = validateUserInfo(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        // Check for existing email:
        const existingEmail = await User.findOne({
            email: new RegExp("^" + req.body.email + "$", "i"),
        });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists!" });
        }
        // hash the password:
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        // create new user:
        const newUser = new User({
            email: req.body.email,
            password: hashPassword,
            name: req.body.name,
        });
        // save user to database:
        const savedUser = await newUser.save();

        // assign JWT & configure Cookie:
        const payload = { userId: savedUser._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("Access-Token", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        // return the user without password (for security):
        const userToReturn = { ...savedUser._doc };
        delete userToReturn.password;

        return res.json(userToReturn);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

// @route   POST /api/auth/login
// @desc    login user and return access token
// @access  Public
router.post("/login", async (req, res) => {
    try {
        // check for the user:
        const checkUser = await User.findOne({
            email: new RegExp("^" + req.body.email + "$", "i"),
        });

        if (!checkUser) {
            return res.status(400).json({ error: "Login credentials invalid!" });
        }

        // check for the user password:
        const passwordMatch = await bcrypt.compare(req.body.password, checkUser.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: "Login credentials invalid!" });
        }

        // assign JWT & configure Cookie:
        const payload = { userId: checkUser._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("Access-Token", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        // return the user without password (for security):
        const userToReturn = { ...checkUser._doc };
        delete userToReturn.password;

        return res.json({
            token: token,
            user: userToReturn,
        });
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

// @route   GET /api/auth/current
// @desc    Return currently authorized user
// @access  Private
router.get("/current", requireAuth, (req, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized");
    }
    return res.json(req.user);
});

// @route   PUT /api/auth/logout
// @desc    Logout the user and clear cookies
// @access  Private
router.put("/logout", async (req, res) => {
    try {
        res.clearCookie("Access-Token");
        return res.json({ success: true });
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;
