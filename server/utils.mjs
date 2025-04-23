import {v4 as uuidv4} from "uuid";
import admin from "firebase-admin";
const db = admin.firestore();
/**
 * @description Generates a unique referral code. It searches in the database if the referral code already exists. If it does, it generates a new one.
 * @param name - Username used to generate the referral code.
 * @returns {string} - A unique referral code.
 * @async
 * */
export async function generateReferralCode(name) {
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
        referralCode = `${name.toLowerCase()}-${uuidv4().slice(0, 4)}`;
        const existingUser = await db.collection("users")
            .where("referralCode", "==", referralCode)
            .get();
        if (existingUser.empty) isUnique = true;
    }
    return referralCode;
}

/**
 * @description Checks if the request is authorized by checking the token in headers.
 * @returns req.user - If the request is authorized it returns the user in the request.
 * @throws 401 - Unauthorized: Missing ID token
 * @throws 403 - Invalid or expired token
 * @async
 * */
export const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
        return res.status(401).json({ error: "Unauthorized: Missing ID token" });
    }
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        next();
    } catch (error) {
        console.log(error);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

/**
 * @description Middleware to verify if a user has completed a payment.
 * @param {object} req - The HTTP request object.
 * @param {string} req.body.uuid - The UUID of the user to verify payment for.
 * @param {object} res - The HTTP response object.
 * @param {function} next - The next middleware function to call if the user has paid.
 * @returns {object} - JSON response with an error message if the user has not paid or if an error occurs.
 * @returns {400} - If the UUID is missing from the request body.
 * @returns {404} - If the user is not found in the database.
 * @returns {403} - If the user has not completed the payment.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request Body:
 * {
 *   "uuid": "user123"
 * }
 *
 * Error Response (User not found):
 * {
 *   "error": "User not found"
 * }
 *
 * Error Response (User hasn't paid):
 * {
 *   "error": "User hasn't paid"
 * }
 */
export const verifyPayment = async (req, res, next) => {
    const { uuid } = req.params;
    if (!uuid) {
        return res.status(400).json({ error: "UUID is required" });
    }
    try {
        const userDoc = await db.collection("users").doc(uuid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        const userData = userDoc.data();
        if (!userData.paid) {
            return res.status(403).json({ error: "User hasn't paid" });
        } else {
            next();
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @description Middleware to verify if a user is an admin.
 * @param {object} req - The HTTP request object.
 * @param {object} req.params - The request parameters.
 * @param {string} req.params.uuid - The UUID of the user to verify admin status for.
 * @param {object} res - The HTTP response object.
 * @param {function} next - The next middleware function to call if the user is an admin.
 * @returns {object} - JSON response with an error message if the user is not an admin or if an error occurs.
 * @returns {400} - If the UUID is missing from the request parameters.
 * @returns {403} - If the user is not an admin.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request Parameters:
 * {
 *   "uuid": "admin123"
 * }
 *
 * Error Response (User not found):
 * {
 *   "error": "No admin found"
 * }
 *
 * Error Response (User is not an admin):
 * {
 *   "error": "Forbidden request. User is not admin."
 * }
 */
export const verifyAdmin = async (req, res, next) => {
    const uid = req.user?.uid;
    if (!uid) {
        return res.status(400).json({ error: "UID is required" });
    }

    try {
        const userDoc = await db.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            return res.status(403).json({ error: "Forbidden. User is not an admin." });
        }

        const userData = userDoc.data();

        if (!userData.isAdmin) {
            return res.status(403).json({ error: "Forbidden. User is not an admin." });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};