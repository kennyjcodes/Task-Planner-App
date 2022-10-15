const express = require("express");
const router = express.Router();
const todoModel = require("../models/Todo");
const auth = require("../middleware/permissions");
const todoValidator = require("../validation/todoValidator");
const validateTodoInput = require("../validation/todoValidator");

// @route   GET /api/todo
// @desc    Test the todo route
// @access  Public
router.get("/test", (req, res) => {
    res.send("Todo route is working...");
});

// @route   POST /api/todos/new
// @desc    Create a new todo
// @access  Private
router.post("/new", auth, async (req, res) => {
    try {
        const { isValid, errors } = todoValidator(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const newTodo = new todoModel({
            user: req.user._id,
            content: req.body.content,
            complete: false,
        });
        await newTodo.save();
        return res.json(newTodo);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

// @route   GET /api/todos/current
// @desc    Current users todo
// @access  Private
router.get("/current", auth, async (req, res) => {
    try {
        const completedTodos = await todoModel
            .find({
                user: req.user._id,
                complete: true,
            })
            .sort({ completedAt: -1 });
        const incompleteTodos = await todoModel
            .find({
                user: req.user._id,
                complete: false,
            })
            .sort({ createdAt: -1 });
        return res.json({ complete: completedTodos, incomplete: incompleteTodos });
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

// @route   PUT /api/todos/:todoID/complete
// @desc    Mark a todo as complete
// @access  Private
router.put("/:todoID/complete", auth, async (req, res) => {
    try {
        const todo = await todoModel.findOne({
            user: req.user._id,
            _id: req.params.todoID,
        });
        if (!todo) {
            return res.status(404).json({ error: "Could not find TODO!" });
        }
        if (todo.complete) {
            return res.status(400).json({ error: "Todo is already complete!" });
        }
        const updatedTodo = await todoModel.findOneAndUpdate(
            {
                user: req.user._id,
                _id: req.params.todoID,
            },
            {
                complete: true,
                completedAt: new Date(),
            },
            {
                new: true,
            },
        );
        return res.json(updatedTodo);
    } catch (error) {
        return res.status(404).send(error.message);
    }
});

// @route   PUT /api/todos/:todoID/incomplete
// @desc    Mark a todo as incomplete
// @access  Private
router.put("/:todoID/incomplete", auth, async (req, res) => {
    try {
        const todo = await todoModel.findOne({
            user: req.user._id,
            _id: req.params.todoID,
        });
        if (!todo) {
            return res.status(404).json({ error: "Could not find TODO!" });
        }
        if (!todo.complete) {
            return res.status(400).json({ error: "Todo is already incomplete!" });
        }
        const updatedTodo = await todoModel.findByIdAndUpdate(
            {
                user: req.user._id,
                _id: req.params.todoID,
            },
            {
                complete: false,
                completedAt: null,
            },
            {
                new: true,
            },
        );
        return res.json(updatedTodo);
    } catch (error) {
        return res.status(404).send(error.message);
    }
});

// @route   PUT /api/todos/:todoID
// @desc    Update a todo
// @access  Private
router.put("/:todoID", auth, async (req, res) => {
    try {
        const todo = await todoModel.findOne({
            user: req.user._id,
            _id: req.params.todoID,
        });
        if (!todo) {
            return res.status(404).json({ error: "Could not find TODO!" });
        }
        const { isValid, errors } = validateTodoInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const updateTodoContent = await todoModel.findByIdAndUpdate(
            {
                user: req.user._id,
                _id: req.params.todoID,
            },
            {
                content: req.body.content,
            },
            {
                new: true,
            },
        );
        return res.json(updateTodoContent);
    } catch (error) {
        return res.status(404).send(error.message);
    }
});

//@route   DELETE /api/tools/:todoID
//@desc    Delete a todo
//@access  Private
router.delete("/:todoID", auth, async (req, res) => {
    try {
        const todo = await todoModel.findOne({
            user: req.user._id,
            _id: req.params.todoID,
        });
        if (!todo) {
            return res.status(404).json({ error: "Could not find TODO!" });
        }
        await todoModel.findOneAndRemove({
            user: req.user._id,
            _id: req.params.todoID,
        });
        return res.json({ success: true });
    } catch (error) {
        return res.status(404).send(error.message);
    }
});

module.exports = router;
