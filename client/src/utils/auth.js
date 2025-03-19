import {
    signInWithEmailAndPassword,
    browserSessionPersistence,
    browserLocalPersistence,
    setPersistence,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    getIdToken,
    deleteUser
} from "firebase/auth";
import { auth } from "./firebase.mjs";
import getError from "./errorHandler.js";

const remoteURL = "http://localhost:3000";

export const loginWithEmail = async (email, password, rememberMe = false) => {
    try {
        await setPersistence(auth, rememberMe ? browserSessionPersistence : browserLocalPersistence);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await auth.currentUser.reload();

        if (!auth.currentUser.emailVerified) {
            await logout();
            return { success: false, message: "Account non verificato. Controlla la tua email." };
        }

        const userVerified = await checkUserVerification(auth.currentUser.uid);
        if (!userVerified.success) {
            await logout();
            return { success: false, message: "Errore durante la verifica. Riprova più tardi." };
        }

        if (!userVerified.verified) {
            const verificationSuccess = await verifyUser(auth.currentUser.uid);
            if (!verificationSuccess) {
                await logout();
                return { success: false, message: "Si è verificato un errore. Riprova più tardi." };
            }
        }

        return { success: true, user: userCredential.user };

    } catch (error) {
        await logout();
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

        await sendEmailVerification(userCredential.user);

        const user = userCredential.user;

        const idToken = await getIdToken(user);

        await logout();

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
}

export async function checkUserVerification(uid) {
    try {
        const idToken = await auth.currentUser.getIdToken();

        const response = await fetch(`${remoteURL}/api/verify-user/${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to check verification status");
        }

        return { success: true, verified: data.verified };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: error.message };
    }
}


export async function verifyUser(uid) {
    try {
        const idToken = await auth.currentUser.getIdToken();

        const response = await fetch(`${remoteURL}/api/verify-user`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ uid }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Verification failed");
        }

        return {success: true};
    } catch (error) {
        console.error("Error:", error);
        return {success: false, error: error};
    }
}

export default loginWithEmail;
