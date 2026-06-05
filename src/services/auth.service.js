const jwt = require('jsonwebtoken')
const crypto = require("crypto");
const ErrorResponse = require("../utils/ErrorResponse");
const { Auth } = require('../models');
const { validatePhoneNumber } = require('../validations/auth.validation');
const { transport } = require('../helpers/emailTransport');

const JWT_SECRET = process.env.JWT_SECRET

const generateToken = async (user_id) => {
    const user = await Auth.findOne({ _id: user_id });
    if (!user) throw new ErrorResponse("User not found", 404);

    const date = new Date();
    if (!user.resetToken.token || user.resetToken.expiry <= date) {
        const buffer = crypto.randomBytes(32);
        const token = buffer.toString("hex");
        const date = new Date();
        date.setDate(date.getDate() + 1);
        await Auth.findOneAndUpdate(
            { _id: user_id },
            {
                resetToken: {
                    token,
                    expiry: date,
                },
            }
        );
        return token;
    }

    return user.resetToken.token;
};

/**
 * Creates a new user account.
 * @param {Object} body - The request body containing user details.
 * @returns {Promise<InventoryAuth>} - The created InventoryAuth user object.
 * @throws {ErrorResponse} - If the email or telephone is already taken.
 */

const createAccount = async (body) => {
    const data = { ...body }

    if (data.telephone && !validatePhoneNumber(data.telephone)) {
        throw new ErrorResponse("Enter Valid Phone Number", 400);
    }
    else if (!data.role) {
        throw new ErrorResponse("Role Required", 400);
    }
    else if (await Auth.isEmailTaken(data.email)) {
        throw new ErrorResponse("Email Already Taken", 400);
    }
    else if (data.telephone && await Auth.isTelephoneTaken(data.telephone)) {
        throw new ErrorResponse("Phone Number Already Taken", 400);
    }

    return await Auth.create(data);
}

/**
 * Creates a new user account.
 * @param {Object} body - The request body containing user details.
 * @returns {Promise<Admin>} - The created Admin user object.
 * @throws {ErrorResponse} - If the email or telephone is already taken.
 */

const newRegister = async (body) => {
    const data = { ...body }

    if (await Auth.isEmailTaken(data.email)) {
        throw new ErrorResponse("Email Already Taken", 400);
    }

    const user = await Auth.create({ ...data, active: false });
    return user
}

/**
 * Authenticates a user using email and password.
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<Object>} - An object containing the InventoryAuthentication status, user data, and JWT token with expiry date.
 * @throws {ErrorResponse} - If JWT_SECRET is not set, the email is not found, or the password is incorrect.
 */

const loginWithEmailAndPass = async (email, password) => {
    if (!JWT_SECRET) throw new ErrorResponse("JWT_SECRET not set", 500);

    const user = await Auth.findOne({ email })
    if (!user) {
        throw new ErrorResponse("Email not found")
    }

    if (!(await user.isPasswordMatch(password))) {
        throw new ErrorResponse("Password is incorrect", 400)
    }

    const token = jwt.sign({
        name: user.name,
        email: user.email,
        user_id: user._id,
    },
        JWT_SECRET, {
        expiresIn: 60 * 60 * 24 * 7, // in 7 days
    }
    )

    let date = new Date();
    date.setDate(date.getDate() + 6);
    delete user.password;
    return {
        success: true,
        data: user,
        jwt: { token, expiry: date.toISOString() }
    }
}

/**
 * Updates the profile of a user by their userId.
 * @param {Object} profile - The updated profile data to be set.
 * @param {String} userId - The unique ID of the user whose profile is being updated.
 * @returns {Object} - The updated user profile object.
 * @throws {ErrorResponse} - Throws an error if the user is not found.
 */

const updateProfile = async (profile, userId) => {
    const updatePro = await Auth.findByIdAndUpdate(
        { _id: userId },              // Match the user by ID
        { $set: { ...profile } },             // Update profile using $set
        { new: true, runValidators: true }
    )

    // Check if the user was found and updated
    if (!updatePro) {
        throw new ErrorResponse("User not found", 404);
    }

    return updatePro;
}

// /**
//  * Initiates the password reset process for a user by email.
//  * @param {string} email - The email address of the user requesting a password reset.
//  * @returns {Promise<string>} - A message indicating that the reset password email has been sent.
//  * @throws {ErrorResponse} - If the user with the provided email is not found.
//  */
// const forgetPassword = async (res, email) => {
//     const user = await InventoryAuth.findOne({ email })
//     if (!user) throw new ErrorResponse("User not found", 404);

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const mainOptions = {
//         from: process.env.EMAIL_BRAVO,
//         to: email,
//         subject: "OTP For Reset Password",
//         text: `Your Password Reset OTP ${otp}`
//     }

//     await transport.sendMail(mainOptions, function (error, info) {
//         if (error) {
//             console.log(error)
//             res.status(500).json({ success: false, error })
//         } else {
//             res.status(200).json({ Success: true, info })
//             console.log(info.response)
//         }
//     })

//     user.otp = otp
//     await user.save();
//     return "Reset password email sended successfully"
// }

// const verifyOtp = async (email, otp) => {
//     const user = await InventoryAuth.findOne({ email })
//     if (!user) throw new ErrorResponse("User not found", 404);

//     if (user.otp != otp) {
//         throw new ErrorResponse("Otp not Matched", 400);
//     }

//     return "Password Verified Successfully";
// }

/**
 * Initiates the password reset process for a user by email.
 * @param {Object} res - Express response object.
 * @param {string} email - The email address of the user requesting a password reset.
 * @returns {Promise<string>} - A message indicating that the reset password email has been sent.
 * @throws {ErrorResponse} - If the user with the provided email is not found.
 */
const forgetPassword = async (res, email) => {
    const user = await Auth.findOne({ email });
    if (!user) throw new ErrorResponse("User not found", 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes expiry

    const mailOptions = {
        from: process.env.BREVO_SENDER_EMAIL,
        to: email,
        subject: "OTP For Reset Password",
        text: `Your password reset OTP is ${otp}. It will expire in 2 minutes.`,
    };

    try {
        const emailSended =  await transport.sendMail(mailOptions);
        console.log("emailSended ==>>", emailSended, mailOptions)
        // Save OTP and expiry
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        
        console.log("forgetPassword user ==>>", user)
        return "Reset password email sent successfully";
    } catch (error) {
        console.error("Error sending email:", error);
        return error
    }
};

/**
 * Verifies the OTP for password reset.
 * @param {string} email - The user's email.
 * @param {string} otp - The OTP entered by the user.
 * @returns {Promise<string>} - A message indicating the OTP verification result.
 * @throws {ErrorResponse} - If the user or OTP is invalid or expired.
 */
const verifyOtp = async (email, otp) => {
    const user = await Auth.findOne({ email });
    if (!user) throw new ErrorResponse("User not found", 404);

    // Check if OTP matches
    if (user.otp !== otp) {
        throw new ErrorResponse("OTP not matched", 400);
    }

    // Check if OTP expired
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
        throw new ErrorResponse("OTP expired", 400);
    }

    // Optional: Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return "Password verified successfully";
};


/**
 * Resets the user's password using the provided token and new password.
 * @param {string} token - The password reset token.
 * @param {string} newPassword - The new password to set for the user.
 * @returns {Promise<string>} - A message indicating that the password has been successfully changed.
 * @throws {ErrorResponse} - If the token is invalid, expired, or if the new password matches the old one.
 */

const resetPassword = async (email, newPassword) => {
    const user = await Auth.findOne({ email })

    if (!user)
        throw new ErrorResponse("User not found", 404);

    if (await user.isPasswordMatch(newPassword)) {
        throw new ErrorResponse("New Password can't be same as previous password", 400);
    }

    await user.changePassword(newPassword)

    return "Password Changed Successfully"
}

module.exports = {
    createAccount,
    loginWithEmailAndPass,
    forgetPassword,
    resetPassword,
    updateProfile,
    newRegister,
    verifyOtp
}
