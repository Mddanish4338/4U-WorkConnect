import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAh3kwE-BWKbCWekUrlzpxhmAOL9pcGCDU",
    authDomain: "u-data-3cbc5.firebaseapp.com",
    projectId: "u-data-3cbc5",
    storageBucket: "u-data-3cbc5.firebasestorage.app",
    messagingSenderId: "1349410075",
    appId: "1:1349410075:web:6b89b407586147f4b7c7be",
    measurementId: "G-RBY8M25GXF"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);