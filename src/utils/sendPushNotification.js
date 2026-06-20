const { messaging } = require("./firebaseAdmin");

async function sendPushNotification(token, title, body, data = {}) {
  console.log("sendPushNotification called");

  if (!token) {
    console.log("No FCM token received");
    return;
  }

  try {
    console.log("Sending push to token:", token);

    const response = await messaging.send({
      token,
      notification: {
        title,
        body,
      },
      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ),
    });

    console.log("Push notification sent:", response);
  } catch (error) {
    console.log("Push notification error:", error);
  }
}

module.exports = sendPushNotification;