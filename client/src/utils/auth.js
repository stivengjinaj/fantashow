import { signInWithEmailAndPassword, browserSessionPersistence, browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth } from "./firebase.mjs";
import getError from "./errorHandler.js";

export const loginWithEmail = async (email, password, rememberMe=false) => {
    try {
        await setPersistence(auth, rememberMe ? browserSessionPersistence : browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.log(error);
        return { success: false, message: getError(error.code) };
    }
};

export const logout = async () => {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, message: getError(error.code) };
    }
};

export default loginWithEmail;
