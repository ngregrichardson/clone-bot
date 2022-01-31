import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "../../firebase/service-account.json";

export let db: FirebaseFirestore.Firestore;

export const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
  db = admin.firestore();
};

export default admin;
