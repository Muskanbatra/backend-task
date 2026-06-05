const asyncHandler = require("../middleware/asyncHandler");
const { TaskServices } = require("../services");

const createTask = asyncHandler(async (req, res) => {
    const task = await TaskServices.createTask(req.body, req.user_detail);

    return res.status(201).json({
        success: true,
        data: task,
        message: "Task created successfully",
    });
});

const getRelatedTasks = asyncHandler(async (req, res) => {
    const tasks = await TaskServices.getRelatedTasks(req.user_detail);

    return res.status(200).json({
        success: true,
        results: tasks,
    });
});

const updateTask = asyncHandler(async (req, res) => {
    const task = await TaskServices.updateTask(req.params.id, req.body, req.user_detail);

    return res.status(200).json({
        success: true,
        data: task,
        message: "Task updated successfully",
    });
});

module.exports = {
    createTask,
    getRelatedTasks,
    updateTask,
};
