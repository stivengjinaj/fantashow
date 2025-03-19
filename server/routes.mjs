import express from "express";
import {v4 as uuidv4} from "uuid";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

/**
 * @description Generates a unique referral code. It searches in the database if the referral code already exists. If it does, it generates a new one.
 * @param name - Username used to generate the referral code.
 * @returns {string} - A unique referral code.
 * @async
 * */
async function generateReferralCode(name) {
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
        referralCode = `${name.toLowerCase()}-${uuidv4().slice(0, 8)}`;
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
const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
        return res.status(401).json({ error: "Unauthorized: Missing ID token" });
    }
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

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
router.post("/api/register", verifyToken, async (req, res) => {
    try {
        const {
            username, email, referredBy, password,
            nome, cognome, annoNascita, cap, squadraDelCuore, cellulare, telegram, uid
        } = req.body;

        const annoNascitaNum = parseInt(annoNascita, 10);

        // Checking if the request is being send by a user who recently registered on firebase.
        if (uid !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized: UID mismatch" });
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

        /*const existingUsers = await db.collection("users").where("username", "==", username).get();
        if (!existingUsers.empty) {
            return res.status(400).json({ error: "Username already taken" });
        }*/

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
            username,
            email,
            nome,
            cognome,
            annoNascita,
            cap,
            squadraDelCuore,
            cellulare,
            telegram,
            isAdmin: false,
            referralCode,
            referredBy: referrerId,
            verified: false,
            paid: false,
            points: 0,
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
 * @route POST /api/register/admin
 * @description Registers a new admin.
 * @param {object} req.body.username - Username of the admin.
 * @param {object} res.body.email - Email of the admin.
 * @param {object} res.body.existingAdminUUID - UUID of the existing admin who is registering this new admin.
 * @returns {object} - JSON response with success message, adminId, and referralCode.
 * @returns {201} - If the admin is registered successfully.
 * @throws {400} - If username or email are missing.
 * @throws {401} - If the request is unauthorized or invalid.
 * @throws {500} - If an internal server error occurs.
 * @async
 * @example
 * Request Body:
 * {
 * "username": "john_doe",
 * "email": "john.doe@example.com"
 * "existingAdminUUID": "cpecoqrj2440vnwefkooqqefpo"
 * }
 *
 * Response:
 * {
 * "message": "Admin registered successfully",
 * "adminId": "qkofneqqepqpopngnqcfmc",
 * "referralCode": "john-39fa"
 * }
 * */
router.post("/api/register/admin", async (req, res) => {
   try {
       const { username, email, existingAdminUUID } = req.body;
       if(!username || !email || username === "" || email === "") {
           return res.status(400).json({ error: "Username and email are required" });
       }
       if(!existingAdminUUID || existingAdminUUID === "") {
           return res.status(401).json({ error: "Unauthorized or invalid request from admin" });
       }
       const existingAdmin = await db.collection("users")
           .where(admin.firestore.FieldPath.documentId(), "==", existingAdminUUID)
           .get()

       if(existingAdmin.empty) {
           //console.log("Admin not found");
           return res.status(401).json({ error: "Unauthorized or invalid request from admin" });
       }
       if(existingAdmin.docs[0].data().isAdmin !== true) {
           //console.log("User is not an admin");
           return res.status(401).json({ error: "Unauthorized or invalid request from admin" });
       }

       // Generate referral code
       const referralCode = await generateReferralCode();

       const newAdmin = {
           username,
           email,
           isAdmin: true,
           createdAt: admin.firestore.FieldValue.serverTimestamp(),
           referralCode: referralCode,
           referredBy: "",
           points: 0,
           verified: true,
       }
       const adminRef = await db.collection("users").add(newAdmin);

       res.status(201).json({
           message: "Admin registered successfully",
           adminId: adminRef.id,
           referralCode: referralCode,
       });
   } catch (error) {
       // console.error("Error registering user:", error);
       res.status(500).json({ error: "Internal Server Error" });
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
router.get("/api/last_login/:userId", verifyToken, async (req, res) => {
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
router.patch("/api/last_login", verifyToken, async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid || uid.trim() === "") {
            return res.status(400).json({ error: "User ID is required" });
        }

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const lastLoginRef = db.collection("last_login").doc(uid);
        const lastLoginDoc = await lastLoginRef.get();

        const now = new Date();
        const today = now.toISOString().split("T")[0]; // YYYY-MM-DD format

        const lastValidStreakUpdate = lastLoginDoc.exists ? lastLoginDoc.data().last_streak_update : today;
        const lastUpdateDate = new Date(lastValidStreakUpdate);
        const dayDifference = Math.floor((now - lastUpdateDate) / (1000 * 60 * 60 * 24));

        let streak = userDoc.data().streak || 0;

        if (dayDifference === 1) {
            streak += 1;
        } else if (dayDifference > 1) {
            streak = 0;
        }

        await userRef.update({ streak });
        await lastLoginRef.set(
            {
                last_login: admin.firestore.FieldValue.serverTimestamp(),
                last_streak_update: today,
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
router.get("/api/verify-user/:uid", verifyToken, async (req, res) => {
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
router.patch("/api/verify-user", verifyToken, async (req, res) => {
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



export default router;
