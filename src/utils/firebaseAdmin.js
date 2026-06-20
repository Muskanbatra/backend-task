const path = require('path');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

const serviceAccountPath = path.resolve(
  __dirname,
  '../../config/firebase-service-account.json'
);

const serviceAccount = require(serviceAccountPath);

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

const messaging = getMessaging(app);

module.exports = {
  messaging,
};