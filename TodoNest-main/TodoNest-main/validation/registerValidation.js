const validator = require("validator");
const isEmpty = require("./isEmpty");

const validateUserInfo = (data) => {
    let errors = {};

    // validate name:
    if (isEmpty(data.name)) {
        errors.name = "Name can not be empty!";
    } else if (!validator.isLength(data.name, { min: 3, max: 15 })) {
        errors.name = "Name must be between 3 and 15 characters!";
    }

    // validate email:
    if (isEmpty(data.email)) {
        errors.email = "Email can not be empty!";
    } else if (!validator.isEmail(data.email)) {
        errors.email = "Email is invalid, Please provide a valid email address!";
    }

    // validate password:
    if (isEmpty(data.password)) {
        errors.password = "Password can not be empty!";
    } else if (!validator.isLength(data.password, { min: 6, max: 15 })) {
        errors.password = "Password must be between 6 and 15 characters!";
    }

    // validate 'confirm password' field:
    if (isEmpty(data.confirmPassword)) {
        errors.confirmPassword = "Password can not be empty!";
    } else if (!validator.equals(data.password, data.confirmPassword)) {
        errors.confirmPassword = "Password and Confirm Password fields must match!";
    }
    return {
        errors,
        isValid: isEmpty(errors),
    };
};
module.exports = validateUserInfo;
