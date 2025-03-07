import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase.mjs";
import getError from "./errorHandler.js";

const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.log(error);
        return { success: false, message: getError(error.code) };
    }
};

export default loginWithEmail;