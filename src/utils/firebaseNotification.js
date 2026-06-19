const getFirebaseAdmin = require("./firebaseAdmin");
const { getMessaging } = require("firebase-admin/messaging");

async function sendFirebaseNotification(user, notification) {
    if (!user?.fcmToken) {
        return;
    }

    const firebaseApp = getFirebaseAdmin();

    if (!firebaseApp) {
        console.warn("Firebase service account missing; skipping push notification.");
        return;
    }

    await getMessaging(firebaseApp).send({
        token: user.fcmToken,
        notification: {
            title: notification.title,
            body: notification.message,
        },
        data: {
            type: String(notification.type ?? ""),
            taskId: String(notification.taskId ?? ""),
            targetScreen: String(notification.targetScreen ?? "notifications"),
            title: String(notification.title ?? ""),
            message: String(notification.message ?? ""),
            recipientUserId: String(user._id),
            recipientBackendUserId: String(user._id),
        },
    });
}

async function sendFirebaseNotificationSafely(user, notification) {
    try {
        await sendFirebaseNotification(user, notification);
    } catch (error) {
        console.error("Failed to send Firebase notification:", error.message);
    }
}

module.exports = {
    sendFirebaseNotification,
    sendFirebaseNotificationSafely,
};
