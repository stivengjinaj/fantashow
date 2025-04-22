const remoteURL = "http://localhost:3000";


const fetchClientSecret = async () => {
    try {
        const response = await fetch(`${remoteURL}/api/create-payment-intent`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        return data.clientSecret;
    } catch (error) {
        console.error("Error fetching client secret:", error);
    }
}

const verifyPayment = async (onErrorNavigate, onVerificationTrue, paymentIntentId, uid) => {

    if (!paymentIntentId) {
        onErrorNavigate();
        return;
    }

    try {
        const response = await fetch(`${remoteURL}/api/verify-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentIntentId, uid }),
        });

        const data = await response.json();

        if (data.success) {
            onVerificationTrue();
        } else {
            onErrorNavigate();
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        onErrorNavigate();
    }
};

const registerFirebaseUser = async (email, password) => {
    try {
        const response = await fetch(`${remoteURL}/api/firebase/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || "Error registering user" };
        }

        return { success: true, uid: data.uid };
    } catch (error) {
        return { success: false, error: error.message || "Error registering user" };
    }
}

const registerUser = async (userData, uid) => {
    try {
        const response = await fetch(`${remoteURL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...userData, uid }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || "Registrazione fallita." };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message || "Errore di rete." };
    }
};


const getLastLogin = async (uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/last_login/${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to get last login");
        }

        return { success: true, data };

    }catch (error) {
        return { success: false, error: error };
    }
}

const updateLastLogin = async (uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/last_login`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({uid})
        })

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed update last login");
        }

        return { success: true, message: "Last login updated" };
    }catch (error) {
        return { success: false, error: error };
    }
}

const insertTransactionId = async (uid, paymentId) => {
    try {
        const response = await fetch(`${remoteURL}/api/card-payment/${uid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentId })
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to insert transaction ID");
        }

        return { success: true, message: data.message };
    }catch (error) {
        return { success: false, error: error };
    }
}

const checkCashPaymentRequest = async (uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/cash-payment/${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to check cash payment request");
        }

        return { success: true, message: data.message };
    }catch (error) {
        return { success: false, error: error };
    }
}

const registerCashPaymentRequest = async (uid) => {
    try {
        const response = await fetch(`${remoteURL}/api/cash-payment/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({uid}),
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to register cash payment request");
        }

        return { success: true, message: data.message };
    }catch (error) {
        return { success: false, error: error };
    }
}

const deleteCashPaymentRequest = async (uid) => {
    try {
        const response = await fetch(`${remoteURL}/api/cash-payment/${uid}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete cash payment request");
        }

        return { success: true, message: data.message };
    }catch (error) {
        return { success: false, error: error };
    }
}

const sendSupportRequest = async (supportMode, name, email, telegram, description) => {
    try {
        const response = await fetch(`${remoteURL}/api/support`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                supportMode, name, email, telegram, description
            })
        })

        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.error || "Failed to send support");
        }

        return { success: true, message: data.message };
    }catch (error) {
        return { success: false, error: error };
    }
}

const checkReferral = async (referralCode) => {
    try {
        const response = await fetch(`${remoteURL}/api/referral/${referralCode}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to check referral");
        }

        return { success: true, message: data.referralUser };
    }catch (error) {
        return { success: false, error: error };
    }
}

const getUserData = async (uuid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/user/${uuid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to get user data");
        }

        return { success: true, message: data.user };
    }catch (error) {
        return { success: false, error: error };
    }
}

const getAdminData = async (uuid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/admin/${uuid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to get admin data");
        }
        return { success: true, message: data.user };
    }catch (error) {
        return { success: false, error: error };
    }
}

const getAllUsers = async (uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/admin/all-users/:uid`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to get all users");
        }

        return { success: true, message: data.users };
    }catch (error) {
        return { success: false, error: error };
    }
}

const adminEditUser = async (adminUid, idToken, edittedUser) => {
    try {
        const response = await fetch(`${remoteURL}/api/admin/edit-user/${adminUid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify(edittedUser)
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to edit user");
        }

        return { success: true, message: data.message };
    }catch (error) {
        return { success: false, error: error };
    }
}

export {
    fetchClientSecret,
    verifyPayment,
    registerFirebaseUser,
    registerUser,
    getLastLogin,
    updateLastLogin,
    insertTransactionId,
    registerCashPaymentRequest,
    deleteCashPaymentRequest,
    sendSupportRequest,
    checkReferral,
    getUserData,
    getAdminData,
    checkCashPaymentRequest,
    getAllUsers,
    adminEditUser,
};