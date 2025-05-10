const remoteURL = "https://fantashow-backend.onrender.com";

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
        return {success: false, error: error.message || "Error fetching client secret"}
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
    } catch {
        onErrorNavigate();
    }
};

const registerAdmin = async (uid, idToken, name, surname, username, email, password) => {
         try {
             const response = await fetch(`${remoteURL}/api/register/admin/${uid}`, {
                 method: "POST",
                 headers: {
                     "Content-Type": "application/json",
                     "Authorization": `Bearer ${idToken}`,
                 },
                 body: JSON.stringify({ name, surname, username, email, password }),
             });

             const data = await response.json();

             if (!response.ok) {
                 throw new Error(data.error || "Failed to register admin");
             }

             return { success: true, message: data.message };
         } catch (error) {
             return { success: false, error: error.message || "Error registering admin" };
         }
     }

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

const resendEmailVerification = async (email) => {
    try {
        const response = await fetch(`${remoteURL}/api/firebase/resend-verification`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if(!response.ok) {
            return { success: false, error: data.error || "Error sending email" };
        }

        return { success: true, message: "Mail inviata" };
    }catch (error) {
        return { success: false, error: error.message || "Error sending email" };
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
            return { success: false, error: data.error || "Error registering user." };
        }
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message || "Error registering user." };
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

const getAllCashPaymentRequests = async (uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/admin/cash-payments/${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to get all cash payment requests");
        }

        return { success: true, message: data.cashPayments };
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

const updateCashPaymentRequest = async (adminUid, paymentIds, idToken, paid) => {
    try {
        const response = await fetch(`${remoteURL}/api/cash-payment/${adminUid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ cashId: paymentIds, paid })
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to update cash payment request");
        }

        return { success: true, message: data.message };
    }catch (error) {
        return { success: false, error: error };
    }
}

const updateCashPaymentList = async (adminUid, paymentIds, idToken, paid) => {
    try {
        const response = await fetch(`${remoteURL}/api/cash-payment/all/${adminUid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ paid, paymentIds })
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to update all cash payment requests");
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
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || "Failed to get admin data" };
        }

        return { success: true, message: data.user };
    } catch (error) {
        return { success: false, error: error.message || "Request error" };
    }
};

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

const getSupportTickets = async (uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/admin/support/${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to get support tickets");
        }

        return { success: true, message: data.tickets };
    }catch (error) {
        return { success: false, error: error };
    }
}

const updateTicketStatus = async (uid, idToken, ticketId, status) => {
    try {
        const response = await fetch(`${remoteURL}/api/admin/support/${uid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ ticketId, status })
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to update ticket status");
        }

        return { success: true, message: data.message };
    }catch (error) {
        return { success: false, error: error };
    }
}

const getUserSubscriptions = async (uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/user-subscriptions/${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json();

        if (!response.ok){
            throw new Error(data.error || "Failed to get user subscription statistics");
        }

        return { success: true, message: data }
    }catch (e){
        return {success: false, error: e.message || "Error fetching user subscriptions"}
    }
}

const updateTeam = async (uid, idToken, team) => {
    try {
        const response = await fetch(`${remoteURL}/api/team/${uid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({team})
        })

        const data = await response.json();

        if (!response.ok){
            new Error(data.error || "Failed to update team");
        }

        return { success: true, message: data }
    }catch (e){
        return {success: false, error: e.message || "Error updating team"}
    }
}

const getStatistics = async (uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/user/statistics/${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            }
        })

        const data = await response.json()

        if (!response.ok){
            new Error(data.error || "Failed to get statistics")
        }

        return { success: true, message: data.message }
    }catch (e) {
        return { success: false, error: e.message || "Failed to get statistics"}
    }
}

export {
    fetchClientSecret,
    verifyPayment,
    registerFirebaseUser,
    resendEmailVerification,
    registerUser,
    getLastLogin,
    updateLastLogin,
    insertTransactionId,
    getAllCashPaymentRequests,
    registerCashPaymentRequest,
    updateCashPaymentRequest,
    updateCashPaymentList,
    deleteCashPaymentRequest,
    checkReferral,
    getUserData,
    getAdminData,
    checkCashPaymentRequest,
    getAllUsers,
    adminEditUser,
    sendSupportRequest,
    getSupportTickets,
    updateTicketStatus,
    registerAdmin,
    getUserSubscriptions,
    updateTeam,
    getStatistics,
};