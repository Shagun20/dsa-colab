import admin from "firebase-admin";
import { readFileSync } from "fs";

// Safe way to load JSON in ES Modules
const serviceAccount = JSON.parse(
  readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://colab-code-ed3cb-default-rtdb.firebaseio.com"
});

// Export constants for use in other files
export const db = admin.database();
export const firestore = admin.firestore();
export const auth = admin.auth();

export default admin;