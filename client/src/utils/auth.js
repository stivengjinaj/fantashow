import {
    signInWithEmailAndPassword,
    browserSessionPersistence,
    browserLocalPersistence,
    setPersistence,
    createUserWithEmailAndPassword,
    getIdToken,
    deleteUser
} from "firebase/auth";
import { auth } from "./firebase.mjs";
import getError from "./errorHandler.js";

export const loginWithEmail = async (email, password, rememberMe=false) => {
    try {
        await setPersistence(auth, rememberMe ? browserSessionPersistence : browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
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

export async function registerUserWithFirebase(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const idToken = await getIdToken(user);

        return { success: true, idToken, uid: user.uid };
    } catch (error) {
        return { success: false, error: error };
    }
}

export async function deleteUnregisteredUser() {
    const user = auth.currentUser;

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }
    try {
        await deleteUser(user);
        return { success: true };
    } catch (error) {
        return { success: false, error: error };
    }
};

export default loginWithEmail;
