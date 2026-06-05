const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        dueDate: {
            type: String,
            required: true,
            trim: true,
        },
        dueTime: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "under_review", "rejected"],
            default: "pending",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
        },
        accepted: {
            type: Boolean,
            default: false,
        },
        reviewComment: {
            type: String,
            default: "",
            trim: true,
        },
        feedback: {
            type: String,
            default: "",
            trim: true,
        },
        completedAt: {
            type: String,
            default: null,
        },
        isPaused: {
            type: Boolean,
            default: false,
        },
        pauseHistory: {
            type: [String],
            default: [],
        },
        totalBreakSeconds: {
            type: Number,
            default: 0,
        },
        pauseStartedAt: {
            type: String,
            default: "",
            trim: true,
        },
        extensionHistory: {
            type: [String],
            default: [],
        },
        completionStatusNote: {
            type: String,
            default: "",
            trim: true,
        },
        actualTimeSpentSeconds: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
