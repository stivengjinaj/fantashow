const ERROR_MESSAGES = {
    FIREBASE_FIRESTORE: {
        INVALID_CREDENTIALS: 401,
        MISSING_CREDENTIALS: 400,
        REGISTER_SUCCESS: 201,
    },
    FIREBASE_AUTHENTICATION: {
        USER_NOT_FOUND: "auth/user-not-found",
        WRONG_PASSWORD: "auth/wrong-password",
        INVALID_EMAIL: "auth/invalid-email",
        USER_DISABLED: "auth/user-disabled",
        EMAIL_ALREADY_IN_USE: "auth/email-already-in-use",
        WEAK_PASSWORD: "auth/weak-password",
        MISSING_CREDENTIALS: "auth/missing-credentials",
        INVALID_CREDENTIALS: "auth/invalid-credential",
        REGISTER_SUCCESS: "auth/register-success",
    },
    ADMINISTRATOR: {
        UNAUTHORIZED: 401,
        MISSING_CREDENTIALS: 400,
        REGISTER_SUCCESS: 201,
    },
    REFERRAL: {
        INVALID_REFERRAL: 401,
    },
    PAYMENT: {

    },
    GENERAL: {
        SERVER_ERROR: 500,
    },
};

export default ERROR_MESSAGES;
