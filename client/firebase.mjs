// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const analytics = getAnalytics(firebaseApp);
