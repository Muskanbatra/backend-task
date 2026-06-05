const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { authMiddleware } = require("../middleware/Api-auth.middleware");
const { TaskController } = require("../controllers");
const { TaskValidation } = require("../validations");

router
    .route("/")
    .get(authMiddleware(), TaskController.getRelatedTasks)
    .post(
        authMiddleware(),
        validate(TaskValidation.createTask),
        TaskController.createTask
    );

router
    .route("/:id")
    .put(
        authMiddleware(),
        validate(TaskValidation.updateTask),
        TaskController.updateTask
    );

module.exports = router;
