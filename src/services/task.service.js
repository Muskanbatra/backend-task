const ErrorResponse = require("../utils/ErrorResponse");
const { Auth, Task } = require("../models");
const { sendFirebaseNotificationSafely } = require("../utils/firebaseNotification");

const taskPopulate = [
    { path: "assignedTo", select: "name email role" },
    { path: "assignedBy", select: "name email role" },
];

const getUserObjectId = (user) => user?._id ?? user;

const getUserName = (user, fallback = "Someone") => user?.name || user?.email || fallback;

const getTaskUser = async (userId) => Auth.findById(userId);

const notifyTaskAssigned = async (task, assignedUser, assignedByUser) => {
    await sendFirebaseNotificationSafely(assignedUser, {
        type: "task_assigned",
        title: "New Task Assigned",
        message: `${getUserName(assignedByUser)} assigned '${task.title}' to you.`,
        taskId: task._id,
        targetScreen: "incomingTask",
    });
};

const notifyTaskUpdate = async (task, previousTask, currentUser, body) => {
    const assignedToUser = await getTaskUser(task.assignedTo);
    const assignedByUser = await getTaskUser(task.assignedBy);
    const didStatusChange = body.status && body.status !== previousTask.status;
    const didAssigneeChange =
        body.assignedTo && String(body.assignedTo) !== String(previousTask.assignedTo);

    if ((body.status === "pending" && didStatusChange) || didAssigneeChange) {
        await notifyTaskAssigned(task, assignedToUser, assignedByUser);
        return;
    }

    if (
        body.status === "under_review" &&
        (didStatusChange || body.reviewComment !== previousTask.reviewComment)
    ) {
        await sendFirebaseNotificationSafely(assignedByUser, {
            type: "task_returned",
            title: "Task Sent For Review",
            message: `${getUserName(assignedToUser)} sent '${task.title}' for your review.`,
            taskId: task._id,
            targetScreen: "reviewTask",
        });
        return;
    }

    if (
        body.status === "rejected" &&
        (didStatusChange || body.reviewComment !== previousTask.reviewComment)
    ) {
        await sendFirebaseNotificationSafely(assignedByUser, {
            type: "task_rejected",
            title: "Task Rejected",
            message: `${getUserName(assignedToUser)} rejected '${task.title}'.`,
            taskId: task._id,
            targetScreen: "reviewTask",
        });
        return;
    }

    if (body.status === "completed" && didStatusChange) {
        const currentUserId = String(getUserObjectId(currentUser));
        const isApprovedByAssigner =
            previousTask.status === "under_review" &&
            String(previousTask.assignedBy) === currentUserId;

        if (isApprovedByAssigner) {
            await sendFirebaseNotificationSafely(assignedToUser, {
                type: "task_approved",
                title: "Task Approved",
                message: `${getUserName(currentUser)} approved '${task.title}'.`,
                taskId: task._id,
                targetScreen: "taskDetails",
            });
            return;
        }

        await sendFirebaseNotificationSafely(assignedByUser, {
            type: "task_completed",
            title: "Task Completed",
            message: `${getUserName(assignedToUser)} completed '${task.title}'.`,
            taskId: task._id,
            targetScreen: "taskDetails",
        });
        return;
    }

    if (
        body.status === "in_progress" &&
        body.feedback?.trim() &&
        body.feedback !== previousTask.feedback
    ) {
        await sendFirebaseNotificationSafely(assignedToUser, {
            type: "task_returned",
            title: "Task Returned",
            message: `${getUserName(currentUser)} returned '${task.title}' for changes.`,
            taskId: task._id,
            targetScreen: "activeTask",
        });
    }
};

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

    await notifyTaskAssigned(createdTask, assignedUser, currentUser);

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

    const previousTask = task.toObject();

    Object.assign(task, body);
    await task.save();

    await notifyTaskUpdate(task, previousTask, currentUser, body);

    return Task.findById(task._id).populate(taskPopulate);
};

module.exports = {
    createTask,
    getRelatedTasks,
    updateTask,
};
