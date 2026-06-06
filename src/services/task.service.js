const ErrorResponse = require("../utils/ErrorResponse");
const { Auth, Task } = require("../models");

const taskPopulate = [
    { path: "assignedTo", select: "name email role" },
    { path: "assignedBy", select: "name email role" },
];

const getUserObjectId = (user) => user?._id ?? user;

const createTask = async (body, currentUser) => {
    const data = { ...body };
    const assignedUser = await Auth.findById(data.assignedTo);

    if (!assignedUser) {
        throw new ErrorResponse("Assigned user not found", 404);
    }

    const createdTask = await Task.create({
        ...data,
        assignedBy: getUserObjectId(currentUser),
    });

    return Task.findById(createdTask._id).populate(taskPopulate);
};

const getRelatedTasks = async () => {
    return Task.find()
        .populate(taskPopulate)
        .sort({ createdAt: -1 });
};

const updateTask = async (taskId, body, currentUser) => {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new ErrorResponse("Task not found", 404);
    }

    const currentUserId = String(getUserObjectId(currentUser));
    const canUpdate =
        String(task.assignedBy) === currentUserId || String(task.assignedTo) === currentUserId;

    if (!canUpdate) {
        throw new ErrorResponse("You do not have access to update this task", 403);
    }

    if (body.assignedTo) {
        const assignedUser = await Auth.findById(body.assignedTo);

        if (!assignedUser) {
            throw new ErrorResponse("Assigned user not found", 404);
        }
    }

    Object.assign(task, body);
    await task.save();

    return Task.findById(task._id).populate(taskPopulate);
};

module.exports = {
    createTask,
    getRelatedTasks,
    updateTask,
};
