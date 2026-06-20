const path = require('path');
const fs = require('fs');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

function getFirebaseServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf8');

    return JSON.parse(json);
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  const serviceAccountPaths = [
    path.resolve(__dirname, '../config/firebase-service-account.json'),
    path.resolve(__dirname, '../../config/firebase-service-account.json'),
  ];

  for (const serviceAccountPath of serviceAccountPaths) {
    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    }
  }

  return null;
}

let messaging = null;

try {
  const serviceAccount = getFirebaseServiceAccount();

  if (serviceAccount) {
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount),
        });

    messaging = getMessaging(app);
  } else {
    console.log('Firebase credentials not configured. Push notifications disabled.');
  }
} catch (error) {
  console.log('Firebase Admin initialization failed:', error.message);
}

module.exports = {
  messaging,
};
