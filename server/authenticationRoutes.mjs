import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
import {generateReferralCode, verifyPayment, verifyToken} from "./utils.mjs";

dotenv.config();

const authenticationRoutes = express.Router();

authenticationRoutes.use(express.json());
authenticationRoutes.use(express.urlencoded({ extended: true }));

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

authenticationRoutes.post("/api/firebase/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        if(!userRecord.uid){
            return res.status(400).json({ error: "Failed to create user" });
        }

        res.status(201).json({
            message: "User registered successfully",
            uid: userRecord.uid,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

/**
 * @route POST /api/register
 * @description Registers a new user.
 * @param {object} req.body - User data to be registered.
 * @returns {object} - JSON response with success message, userId, and referralCode.
 * @returns {201} - If the user is registered successfully.
 * @throws {400} - If data is missing.
 * @throws {401} - If the provided referral code is invalid.
 * @throws {402} - User already registered.
 * @throws {403} - Unauthorized request.
 * @throws {500} - If an internal server error occurs.
 * @async
 * @example
 * Request Body:
 * {
 * "username": "john_doe",
 * "email": "john.doe@example.com",
 * "referredBy": "jfeijs"
 * }
 *
 * Response:
 * {
 * "message": "User registered successfully",
 * "userId": "pgppaqcbqcbhqebkyuyxu",
 * "referralCode": "john-fffc"
 * }
 */
authenticationRoutes.post("/api/register", async (req, res) => {
    try {
        const {
            username, email, referredBy, password,
            nome, cognome, annoNascita, cap, squadraDelCuore, cellulare, telegram, uid
        } = req.body;

        const annoNascitaNum = parseInt(annoNascita, 10);

        // Checking if the request is being sent by a user who recently registered on firebase.
        if (!uid) {
            return res.status(403).json({ error: "Unauthorized request" });
        }

        // Checking data validity.
        const existingUser = await db.collection("users").doc(uid).get();
        if (existingUser.exists) {
            return res.status(402).json({ error: "User already registered" });
        }
        if (!username || !email || !password || !nome || !cognome || !squadraDelCuore || !cellulare || !telegram) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (annoNascita && (isNaN(annoNascitaNum) || annoNascitaNum < 1900 || annoNascitaNum > new Date().getFullYear())) {
            return res.status(400).json({ error: "Invalid birth year value" });
        }
        if (cap && (!/^\d{4,5}$/.test(cap))) {
            return res.status(400).json({ error: "Invalid postal code" });
        }
        if (cellulare && !/^\d{10,15}$/.test(cellulare.trim())) {
            return res.status(400).json({ error: "Invalid phone number format" });
        }


        const existingEmails = await db.collection("users").where("email", "==", email).get();
        if (!existingEmails.empty) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Generate referral code
        const referralCode = await generateReferralCode(nome);

        // Validate referral code
        let referrerId = null;
        if (referredBy) {
            const referrerSnapshot = await db.collection("users")
                .where("referralCode", "==", referredBy)
                .limit(1)
                .get();

            if (!referrerSnapshot.empty) {
                const referrerDoc = referrerSnapshot.docs[0];
                referrerId = referredBy;

                // Reward referral points
                await referrerDoc.ref.update({
                    points: admin.firestore.FieldValue.increment(1),
                });
            } else {
                return res.status(401).json({ error: "Invalid referral code" });
            }
        }else {
            return res.status(401).json({ error: "Invalid referral code" });
        }

        const newUser = {
            username: username,
            email: email,
            name: nome,
            surname: cognome,
            birthYear: annoNascita,
            cap: cap,
            team: squadraDelCuore,
            phone: cellulare,
            telegram: telegram,
            isAdmin: false,
            referralCode: referralCode,
            referredBy: referrerId,
            verified: false,
            paid: false,
            points: 0,
            coins: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const last_login = {
            last_login: admin.firestore.FieldValue.serverTimestamp(),
            last_streak_update: admin.firestore.FieldValue.serverTimestamp(),
            streak: 1
        };

        // Save user to Firestore
        await db.collection("users").doc(uid).set(newUser);
        await db.collection("last_login").doc(uid).set(last_login);

        res.status(201).json({
            message: "User registered successfully",
            userId: uid,
            referralCode: referralCode,
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route POST /api/delete-user
 * @description Deletes a user from Firebase Authentication based on their UID.
 * @async
 * @param {object} req - The HTTP request object.
 * @param {string} req.body.uid - The UID of the user to be deleted.
 * @param {object} res - The HTTP response object.
 * @returns {object} - JSON response indicating the success or failure of the operation.
 * @returns {400} - If the UID is missing from the request body.
 * @returns {500} - If an error occurs while deleting the user.
 * @example
 * Request Body:
 * {
 *   "uid": "user123"
 * }
 *
 * Successful Response:
 * {
 *   "success": true,
 *   "message": "User deleted from Firebase Auth"
 * }
 *
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Failed to delete user"
 * }
 */
authenticationRoutes.post("/api/delete-user", async (req, res) => {
    const { uid } = req.body;
    console.log(uid);
    if (!uid) {
        return res.status(400).json({ success: false, error: "Missing uid" });
    }

    try {
        await admin.auth().deleteUser(uid);
        return res.json({ success: true, message: "User deleted from Firebase Auth" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ success: false, error: "Failed to delete user" });
    }
});

/**
 * @route GET /api/get/last_login
 * @description Retrieves the last login time of a user.
 * @param {object} req.body.userId - ID of the user.
 * @returns {object} - JSON response with last login time and username.
 * @returns {200} - If the last login time is retrieved successfully.
 * @throws {400} - If userId is missing.
 * @throws {404} - If the last login time is not found.
 * @throws {500} - If an internal server error occurs.
 * @async
 * @example
 * Request Body:
 * {
 * "userId": "pgppaqcbqcbhqebkyuyxu"
 * }
 * Response:
 * {
 * "message": "Last login retrieved successfully",
 * "last_login": "2022-01-01T00:00:00.000Z"
 * }
 * */
authenticationRoutes.get("/api/last_login/:userId", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || userId.trim() === "") {
            return res.status(400).json({ error: "User ID is required" });
        }

        const lastLoginDoc = await db.collection("last_login").doc(userId).get();

        if (!lastLoginDoc.exists) {
            return res.status(404).json({ error: "Last login not found" });
        }

        res.status(200).json({
            message: "Last login retrieved successfully",
            last_login: lastLoginDoc.data(),
        });
    } catch (error) {
        console.error("Error getting last login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * @route PATCH /api/last_login
 * @description Updates the last login time of a user.
 * @param {object} req.body.userId - ID of the user.
 * @returns {object} - JSON response with success message.
 * @returns {201} - If the last login time is updated successfully.
 * @throws {400} - If userId is missing.
 * @throws {404} - If the user is not found.
 * @throws {500} - If an internal server error occurs.
 * @async
 * @example
 * Request Body:
 * {
 * "uid": "pgppaqcbqcbhqebkyuyxu"
 * }
 * Response:
 * {
 * "message": "Last login updated successfully"
 * }
 */
authenticationRoutes.patch("/api/last_login", verifyToken, async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid || uid.trim() === "") {
            return res.status(400).json({ error: "User ID is required" });
        }

        const lastLoginRef = db.collection("last_login").doc(uid);
        const lastLoginDoc = await lastLoginRef.get();

        const now = new Date();
        const today = now.toISOString().split("T")[0]; // YYYY-MM-DD format

        const lastValidStreakUpdate = lastLoginDoc.exists ? lastLoginDoc.data().last_streak_update : today;
        const lastUpdateDate = new Date(lastValidStreakUpdate);
        const dayDifference = Math.floor((now - lastUpdateDate) / (1000 * 60 * 60 * 24));

        let streak = lastLoginDoc.exists ? lastLoginDoc.data().streak || 0 : 0;

        if (dayDifference === 1) {
            streak += 1;
        } else if (dayDifference > 1) {
            streak = 0;
        }

        await lastLoginRef.set(
            {
                last_login: admin.firestore.FieldValue.serverTimestamp(),
                last_streak_update: today,
                streak,
            },
            { merge: true }
        );

        res.status(200).json({ message: "Last login updated successfully", streak });
    } catch (error) {
        console.error("Error updating last login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * @route GET /api/check-verification/:uid
 * @description Checks if a user is verified based on their UID.
 * @param {string} req.params.uid - The UID of the user to check verification status for.
 * @returns {object} - JSON response with the verification status.
 * @returns {200} - If the user is found and the verification status is retrieved successfully.
 * @returns {404} - If the user is not found.
 * @returns {304} - If the data hasn't changed since the last time it was requested.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * GET /api/check-verification/pgppaqcbqcbhqebkyuyxu
 *
 * Response:
 * {
 * "verified": true
 * }
 */
authenticationRoutes.get("/api/verify-user/:uid", verifyToken, async (req, res) => {
    try {
        const { uid } = req.params;

        const userDoc = await db.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        const isVerified = userData.verified ?? false;

        res.status(200).json({ verified: isVerified });
    } catch (error) {
        console.error("Error checking verification:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route PATCH /api/verify-user
 * @description Updates verification status of a user based on their UID.
 * @param {object} req.body.uid - The UID of the user to verify.
 * @returns {object} - JSON response with a success message.
 * @returns {200} - If the user verification is updated successfully.
 * @returns {400} - If the UID is missing.
 * @returns {404} - If the user is not found.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request Body:
 * {
 * "uid": "pgppaqcbqcbhqebkyuyxu"
 * }
 *
 * Response:
 * {
 * "message": "User verified successfully"
 * }
 */
authenticationRoutes.patch("/api/verify-user", verifyToken, async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        await userRef.update({ verified: true });

        res.status(200).json({ message: "User verified successfully" });
    } catch (error) {
        console.error("Error verifying user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route GET /api/user/:uuid
 * @description Retrieves user data based on the provided UUID.
 * @param {string} req.params.uuid - The UUID of the user to retrieve.
 * @returns {object} - JSON response containing the user data.
 * @returns {200} - If the user data is retrieved successfully.
 * @returns {400} - If the UUID is missing from the request.
 * @returns {403} - If user hasn't completed payment.
 * @returns {404} - If the user is not found in the database.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * GET /api/user/123e4567-e89b-12d3-a456-426614174000
 *
 * Response:
 * {
 *   "message": "User data retrieved successfully",
 *   "user": {
 *     "username": "john_doe",
 *     "email": "john.doe@example.com",
 *     ...
 *   }
 * }
 */
authenticationRoutes.get("/api/user/:uuid", verifyToken, verifyPayment, async (req, res) => {
    try {
        const { uuid } = req.params;

        if (!uuid) {
            return res.status(400).json({ error: "UUID is required" });
        }

        const userDoc = await db.collection("users").doc(uuid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User data retrieved successfully",
            user: userDoc.data(),
        });
    } catch (error) {
        console.error("Error getting user data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default authenticationRoutes;