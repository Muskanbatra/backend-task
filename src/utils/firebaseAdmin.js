const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPaths = [
    path.resolve(__dirname, "../../config/firebase-service-account.json"),
    path.resolve(__dirname, "../config/firebase-service-account.json"),
];

let firebaseApp = null;

function getFirebaseAdmin() {
    if (firebaseApp) {
        return firebaseApp;
    }

    const serviceAccountPath = serviceAccountPaths.find((filePath) =>
        fs.existsSync(filePath)
    );

    if (!serviceAccountPath) {
        return null;
    }

    const serviceAccount = require(serviceAccountPath);

    const apps = typeof admin.getApps === "function" ? admin.getApps() : admin.apps;
    const getApp = typeof admin.getApp === "function" ? admin.getApp : admin.app;
    const credential = admin.credential?.cert
        ? admin.credential.cert(serviceAccount)
        : admin.cert(serviceAccount);

    firebaseApp = apps.length
        ? getApp()
        : admin.initializeApp({
            credential,
        });

    return firebaseApp;
}

module.exports = getFirebaseAdmin;
