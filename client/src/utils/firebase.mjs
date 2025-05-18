import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPkVtIaWLJbpbdIaVzUPtXCVN2H_RYVwQ",
    authDomain: "fantashow-bologna.firebaseapp.com",
    projectId: "fantashow-bologna",
    storageBucket: "fantashow-bologna.firebasestorage.app",
    messagingSenderId: "745433750176",
    appId: "1:745433750176:web:b3342dfbad01e1bfbb47c5",
    measurementId: "G-NRCD3TZY69"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const secondaryApp = initializeApp(firebaseConfig, "secondary");
const adminAuth = getAuth(secondaryApp);

const analytics = getAnalytics(firebaseApp);

export { auth, adminAuth };
