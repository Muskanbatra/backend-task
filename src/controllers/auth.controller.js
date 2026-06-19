const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const { AuthServices } = require("../services");
const { Auth } = require("../models");

/**
 * This function is used to create a new user account.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Returns the created user object.
 */
const createAccount = asyncHandler(async (req, res) => {
    const user = await AuthServices.createAccount(req.body);
    return res.status(201).json({
        success: true,
        data: user,
        message: "Account created successfully"
    });
});

/**
 * This function is used to create a new register.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Returns the created user object.
 */
const newRegister = asyncHandler(async (req, res) => {
    console.log("")
    const user = await AuthServices.newRegister(req.body)
    return res.status(201).json({
        success: true,
        data: user,
        mgs: "Account created successfully"
    })
})

/**
 * This function is used to log in a user with email and password.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Returns the authenticated user object and sets a JWT token in the cookie.
 */
const loginWithEmailAndPass = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await AuthServices.loginWithEmailAndPass(email, password);
    const jwt = user.jwt
    return res
        .cookie('token',
            jwt.token, {
            maxAge: process.env.MAX_AGE_FOR_TOKEN,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })
        .status(200)
        .json(user);
});


/**
 * Validates if the Auth exists and retrieves their details.
 * @param {Object} req - Express request object containing user details in `req.user_detail`.
 * @param {Object} res - Express response object.
 * @throws {ErrorResponse} - Throws an error if the user is not found.
 * @returns {Object} - JSON response containing the Auth's details.
 */
const validateAuth = asyncHandler(async (req, res) => {
    const userId = req.user_detail;
    if (!userId) {
        throw new ErrorResponse("User Not Found", 400)
    }

    const data = await Auth.findById(userId).select('-password -resetToken -emailVerified')
    return res.status(200).json({ success: true, data });
})

/**
 * Updates the profile of the authenticated user.
 * @param {Object} req - Express request object containing the updated profile in the body and user details in `req.user_detail`.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response indicating success and the updated profile data.
 */

const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const data = await AuthServices.updateProfile(req.body, userId)
    return res.status(200).json({
        success: true,
        data,
        message: "Profile Updated Successfully"
    });
})

/**
 * Retrieves a paginated list of all users.
 * @param {Object} req - Express request object containing pagination parameters in query string (`page` and `limit`).
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response containing paginated user data and pagination information.
 */

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = req.query.query?.trim();

    const skip = (page - 1) * limit;

    const searchCondition = query
        ? {
            $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { telephone: { $regex: query, $options: "i" } },
            ],
        }
        : {};

    const users = await Auth.find(searchCondition)
        .select("-password -resetToken")
        .skip(skip)
        .limit(limit);

    const totalItems = await Auth.countDocuments(searchCondition);

    return res.status(200).json({
        success: true,
        results: users,
        pge: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
        limit,
    });
});


/**
 * Deletes a user account by its ID.
 * @param {Object} req - Express request object containing the `id` parameter in the URL.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response indicating success or failure of the delete operation.
 */

const deleteAccount = asyncHandler(async (req, res) => {
    const { id } = req.params
    if (!id) {
        throw new ErrorResponse("Account Id Required", 400)
    }
    const data = await Auth.findByIdAndDelete(id)
    return res.status(200).json({
        success: true,
        data,
        message: "Deleted Successfully"
    });
})


/**
 * This function is used to initiate the password reset process.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Returns a message indicating that the reset password email has been sent.
 */

const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const data = await AuthServices.forgetPassword(res , email);
    return res.status(200).json({ success: true, message: data });
});

// verifyOtp
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const data = await AuthServices.verifyOtp(email, otp);
    return res.status(200).json({ success: true, message: data });
});

/**
 * This function is used to reset the user's password using a token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Returns a message indicating that the password has been successfully changed.
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    const data = await AuthServices.resetPassword(email, newPassword);
    return res.status(200).json({ success: true, data });
});

module.exports = {
    createAccount,
    loginWithEmailAndPass,
    forgetPassword,
    resetPassword,
    validateAuth,
    updateProfile,
    getAllUsers,
    deleteAccount,
    newRegister,
    verifyOtp
};
