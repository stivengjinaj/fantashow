import {
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    getIdToken,
    sendEmailVerification,
    sendPasswordResetEmail,
    setPersistence,
    signInWithEmailAndPassword
} from "firebase/auth";
import {adminAuth, auth} from "./firebase.mjs";
import getError from "./errorHandler.js";

const remoteURL = "https://fantashow-server.onrender.com";

export const loginWithEmail = async (email, password, rememberMe = false) => {
    try {
        await setPersistence(auth, rememberMe ? browserSessionPersistence : browserLocalPersistence);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        //await auth.currentUser.reload();

        if (!auth.currentUser.emailVerified) {
            await logout();
            return { success: false, message: "Account non verificato. Controlla la tua email.", code: 406 };
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

export const logoutFromAdmin = async () => {
    try {
        await adminAuth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, message: getError(error.code) };
    }
}

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

export async function registerUserWithFirebaseAdmin(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);

        await sendEmailVerification(userCredential.user);

        const user = userCredential.user;

        const idToken = await getIdToken(user);

        await logoutFromAdmin();

        return { success: true, idToken, uid: user.uid };
    } catch (error) {
        return { success: false, error: error };
    }
}

export async function adminRegisterWithoutLogout(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);

        await sendEmailVerification(userCredential.user);

        const user = userCredential.user;

        const idToken = await getIdToken(user);

        return { success: true, newAdminToken: idToken, newAdminUid: user.uid };
    } catch (error) {
        return { success: false, error: error };
    }
}

export async function deleteUnregisteredUser(uid) {
    try {
        const response = await fetch(`${remoteURL}/api/delete-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid }),
        });

        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
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
        return {success: false, error: error};
    }
}

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true , message: "Password reset successfully." };
    }catch (error) {
        return { success: false, error: error };
    }
}

export function checkLoggedIn() {
    return auth.currentUser;
}