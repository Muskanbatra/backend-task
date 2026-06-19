const express = require("express")
const router = express.Router()
const validate = require("../middleware/validate")
const { AuthController } = require("../controllers")
const { AuthValidation } = require("../validations")
const { authMiddleware } = require("../middleware/Api-auth.middleware")

router
    .route("/register")
    .post(validate(AuthValidation.newRegister),
        AuthController.newRegister)

router
    .route("/create_account")
    .post(authMiddleware(),
        validate(AuthValidation.createAccount),
        AuthController.createAccount)


router
    .route("/login")
    .post(validate(AuthValidation.login),
        AuthController.loginWithEmailAndPass)

router
    .route("/forgot_password")
    .post(validate(AuthValidation.forgotPassword),
        AuthController.forgetPassword)

router
    .route("/reset_password")
    .post(validate(AuthValidation.resetPassword),
        AuthController.resetPassword)

router
    .route("/verify_otp")
    .post(AuthController.verifyOtp)


router
    .route("/valid_user")
    .get(authMiddleware(),
        AuthController.validateAuth)

router
    .route("/update_profile/:id")
    .put(authMiddleware(),
        validate(AuthValidation.updateProfile),
        AuthController.updateProfile)

router
    .route("/get_all_users")
    .get(authMiddleware(),
        AuthController.getAllUsers)


router
    .route("/delete_account/:id")
    .delete(authMiddleware(),
        AuthController.deleteAccount)

module.exports = router