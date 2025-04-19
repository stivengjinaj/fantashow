import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../utils/firebase.mjs";
import { logout } from "../../utils/auth.js";
import {getAdminData} from "../../API.js";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await currentUser.reload();
                if (currentUser.emailVerified) {
                    setUser(currentUser);
                    const idToken = await currentUser.getIdToken();
                    const adminData = await getAdminData(currentUser.uid, idToken);
                    setIsAdmin(adminData.message.isAdmin);
                } else {
                    await logout();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, isAdmin, loading }}>
            {children}
        </UserContext.Provider>
    );
};
