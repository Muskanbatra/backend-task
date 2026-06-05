const Joi = require("joi");

const createTask = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().allow("").optional(),
        dueDate: Joi.string().required(),
        dueTime: Joi.string().allow("").optional(),
        assignedTo: Joi.string().required(),
        status: Joi.string()
            .valid("pending", "in_progress", "completed", "under_review", "rejected")
            .optional(),
        accepted: Joi.boolean().optional(),
        reviewComment: Joi.string().allow("").optional(),
        feedback: Joi.string().allow("").optional(),
        completedAt: Joi.string().allow(null, "").optional(),
        isPaused: Joi.boolean().optional(),
        pauseHistory: Joi.array().items(Joi.string()).optional(),
        totalBreakSeconds: Joi.number().min(0).optional(),
        pauseStartedAt: Joi.string().allow("").optional(),
        extensionHistory: Joi.array().items(Joi.string()).optional(),
        completionStatusNote: Joi.string().allow("").optional(),
        actualTimeSpentSeconds: Joi.number().min(0).optional(),
    }),
};

const updateTask = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().allow("").optional(),
        dueDate: Joi.string().required(),
        dueTime: Joi.string().allow("").optional(),
        assignedTo: Joi.string().required(),
        status: Joi.string()
            .valid("pending", "in_progress", "completed", "under_review", "rejected")
            .optional(),
        accepted: Joi.boolean().optional(),
        reviewComment: Joi.string().allow("").optional(),
        feedback: Joi.string().allow("").optional(),
        completedAt: Joi.string().allow(null, "").optional(),
        isPaused: Joi.boolean().optional(),
        pauseHistory: Joi.array().items(Joi.string()).optional(),
        totalBreakSeconds: Joi.number().min(0).optional(),
        pauseStartedAt: Joi.string().allow("").optional(),
        extensionHistory: Joi.array().items(Joi.string()).optional(),
        completionStatusNote: Joi.string().allow("").optional(),
        actualTimeSpentSeconds: Joi.number().min(0).optional(),
    }),
};

module.exports = {
    createTask,
    updateTask,
};
