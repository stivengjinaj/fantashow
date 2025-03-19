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

const verifyPayment = async (onErrorNavigate, onVerificationTrue, paymentIntentId) => {

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
            body: JSON.stringify({ paymentIntentId }),
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

const registerUser = async (userData, uid, idToken) => {
    try {
        const response = await fetch(`${remoteURL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ ...userData, uid }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Registration failed");
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error: error };
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



export {
    fetchClientSecret,
    verifyPayment,
    registerUser,
    getLastLogin,
    updateLastLogin
};