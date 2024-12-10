import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Paste your firebaseConfig from Firebase Console here
const firebaseConfig = {
    apiKey: "AIzaSyBBx-gFOlSdktcv3sJbmL6_yzkMtpK2Mug",
    authDomain: "summitive-e4db9.firebaseapp.com",
    projectId: "summitive-e4db9",
    storageBucket: "summitive-e4db9.firebasestorage.app",
    messagingSenderId: "1028730663711",
    appId: "1:1028730663711:web:14dd00f4dd1bb3c285f62a"
};

const config = initializeApp(firebaseConfig)
const auth = getAuth(config);
const firestore = getFirestore(config);

export { auth, firestore };