import {createContext, useCallback, useEffect, useState} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../utils/firebase.mjs";
import { logout } from "../../utils/auth.js";
import { getAdminData } from "../../API.js";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);

            try {
                const registrationInProgress = localStorage.getItem("registrationInProgress") === "true";

                if (currentUser) {
                    if (registrationInProgress) {
                        setLoading(false);
                        return;
                    }

                    if (!currentUser.emailVerified) {
                        await logout();
                        setUser(null);
                        setIsAdmin(false);
                        setLoading(false);
                        return;
                    }

                    setUser(currentUser);

                    try {
                        const idToken = await currentUser.getIdToken();
                        const adminData = await getAdminData(currentUser.uid, idToken);

                        if (adminData.success) {
                            setIsAdmin(adminData.message.isAdmin);
                        } else {
                            setIsAdmin(false);
                        }
                    } catch (error) {
                        console.error("Error fetching admin status:", error);
                        setIsAdmin(false);
                    }
                } else {
                    // No user is logged in
                    setUser(null);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error in auth state change handler:", error);
                setUser(null);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, isAdmin, loading }}>
            {children}
        </UserContext.Provider>
    );
};