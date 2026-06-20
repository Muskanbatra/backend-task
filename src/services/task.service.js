const ErrorResponse = require("../utils/ErrorResponse");
const { Auth, Task } = require("../models");
const sendPushNotification = require("../utils/sendPushNotification");

const taskPopulate = [
    { path: "assignedTo", select: "name email role fcmToken" },
    { path: "assignedBy", select: "name email role fcmToken" },
];

const getUserObjectId = user => user?._id ?? user;

async function sendTaskPush(userId, title, message, data) {
    const user = await Auth.findById(userId);

    if (!user?.fcmToken) {
        console.log("No FCM token for user:", userId);
        return;
    }

    await sendPushNotification(user.fcmToken, title, message, {
        ...data,
        recipientBackendUserId: String(user._id),
    });
}

const createTask = async (body, currentUser) => {
    const data = { ...body };
    const assignedUser = await Auth.findById(data.assignedTo);
    console.log("CREATE TASK BODY:", body);
    console.log("ASSIGNED USER:", assignedUser?.name);
    console.log("ASSIGNED USER FCM:", assignedUser?.fcmToken);
    if (!assignedUser) {
        throw new ErrorResponse("Assigned user not found", 404);
    }

    const createdTask = await Task.create({
        ...data,
        assignedBy: getUserObjectId(currentUser),
    });
    if (assignedUser?.fcmToken) {
        console.log("Calling Firebase push for task assigned");

        await sendPushNotification(
            assignedUser.fcmToken,
            "New Task Assigned",
            `${currentUser.name || "Admin"} assigned "${createdTask.title}" to you.`,
            {
                type: "task_assigned",
                taskId: String(createdTask._id),
                targetScreen: "incomingTask",
                recipientBackendUserId: String(assignedUser._id),
            }
        );
    } else {
        console.log("No FCM token found for assigned user");
    }

    return Task.findById(createdTask._id).populate(taskPopulate);
};

const getRelatedTasks = async () => {
    return Task.find().populate(taskPopulate).sort({ createdAt: -1 });
};

const updateTask = async (taskId, body, currentUser) => {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new ErrorResponse("Task not found", 404);
    }

    const oldStatus = task.status;

    const currentUserId = String(getUserObjectId(currentUser));
    const canUpdate =
        String(task.assignedBy) === currentUserId ||
        String(task.assignedTo) === currentUserId;

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

    const updatedTask = await Task.findById(task._id).populate(taskPopulate);

    if (body.status && oldStatus !== body.status) {
        if (body.status === "under_review") {
            await sendTaskPush(
                task.assignedBy,
                "Task Sent for Review",
                `"${task.title}" has been submitted for review.`,
                {
                    type: "task_completed",
                    taskId: String(task._id),
                    targetScreen: "manageTasks",
                }
            );
        }

        if (body.status === "completed") {
            await sendTaskPush(
                task.assignedTo,
                "Task Approved",
                `"${task.title}" has been approved.`,
                {
                    type: "task_approved",
                    taskId: String(task._id),
                    targetScreen: "completedTasks",
                }
            );
        }

        if (body.status === "rejected") {
            await sendTaskPush(
                task.assignedTo,
                "Task Rejected",
                `"${task.title}" has been rejected.`,
                {
                    type: "task_rejected",
                    taskId: String(task._id),
                    targetScreen: "myTasks",
                }
            );
        }
    }

    return updatedTask;
};

module.exports = {
    createTask,
    getRelatedTasks,
    updateTask,
};