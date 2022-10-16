const { Schema, model } = require("mongoose");

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

// export schema/model:
const User = model("User", userSchema);
module.exports = User;
