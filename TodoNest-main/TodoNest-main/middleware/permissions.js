const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
    const token = req.cookies["Access-Token"];
    let isAuthorized = false;
    if (token) {
        try {
            const { userId } = jwt.verify(token, process.env.JWT_SECRET);
            try {
                const user = await User.findById(userId);
                if (user) {
                    const userToReturn = { ...user._doc };
                    delete userToReturn.password;
                    req.user = userToReturn;
                    isAuthorized = true;
                }
            } catch {
                isAuthorized = false;
            }
        } catch {
            isAuthorized = false;
        }
    }
    if (isAuthorized) {
        return next();
    } else {
        return res.status(401).send("Unauthorized");
    }
};

module.exports = requireAuth;
