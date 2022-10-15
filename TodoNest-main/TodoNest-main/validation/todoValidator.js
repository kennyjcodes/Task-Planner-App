const validator = require("validator");
const isEmpty = require("./isEmpty");

const validateTodoInput = (data) => {
    let errors = {};

    if (isEmpty(data.content)) {
        errors.content = "Content field cannot be empty.";
    } else if (!validator.isLength(data.content, { min: 1, max: 300 })) {
        errors.content = "Content field should have 1 to 300 characters.";
    }
    return {
        errors,
        isValid: isEmpty(errors),
    };
};

module.exports = validateTodoInput;
