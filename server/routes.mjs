import express from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const router = express.Router();

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

/**
 * @description Generates a unique referral code. It searches in the database if the referral code already exists. If it does, it generates a new one.
 * @returns {string} - A unique referral code.
 * @async
 * */
async function generateReferralCode() {
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
        referralCode = uuidv4().slice(0, 8); // Shorten UUID to 8 characters
        const existingUser = await db.collection("users")
            .where("referralCode", "==", referralCode)
            .get();
        if (existingUser.empty) isUnique = true;
    }
    return referralCode;
}

/**
 * @route POST /register
 * @description Registers a new user.
 * @param {object} req.body.username - Username of the user.
 * @param {object} res.body.email - Email of the user.
 * @param {object} res.body.referredBy - Referral code of the user who referred this user.
 * @returns {object} - JSON response with success message, userId, and referralCode.
 * @returns {201} - If the user is registered successfully.
 * @throws {400} - If username or email are missing.
 * @throws {401} - If the provided referral code is invalid.
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
router.post("/register", async (req, res) => {
    try {
        const { username, email, referredBy} = req.body;
        if (username === undefined || username === null || username === "" ||
            email === undefined || email === null || email === "" ||
            referredBy === undefined || referredBy === null || referredBy === "") {
            return res.status(400).json({ error: "Username, email, and referral code are required" });
        }

        // Generate referral code
        const referralCode = await generateReferralCode();

        // Validate referredBy (check if referralCode exists)
        let referrerId = null;
        if (referredBy) {
            const referrerSnapshot = await db.collection("users")
                .where("referralCode", "==", referredBy)
                .limit(1)
                .get();

            if (!referrerSnapshot.empty) {
                const referrerDoc = referrerSnapshot.docs[0];
                referrerId = referredBy;

                // Referral award logics
                await referrerDoc.ref.update({
                    points: admin.firestore.FieldValue.increment(1),
                });
            } else {
                return res.status(401).json({ error: "Invalid referral code" });
            }
        }

        // Create user data
        const newUser = {
            username: username,
            email: email,
            isAdmin: false,
            referralCode: referralCode,
            referredBy: referrerId,
            verified: true,
            points: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const last_login = {
            last_login: admin.firestore.FieldValue.serverTimestamp(),
            username: username,
        }

        // Save user to Firestore and last login to Firestore
        const userRef = await db.collection("users").add(newUser);
        await db.collection("last_login").doc(userRef.id).set(last_login);

        res.status(201).json({
            message: "User registered successfully",
            userId: userRef.id,
            referralCode: referralCode,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route POST /register/admin
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
router.post("/register/admin", async (req, res) => {
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
 * @route POST /get/last_login
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
router.post("/get/last_login", async (req, res) => {
    try {
        const { userId } = req.body;
        if(!userId || userId === "") {
            return res.status(400).json({ error: "User ID is required" });
        }
        const last_login = await db.collection("last_login").doc(userId).get();
        if(!last_login.exists) {
            return res.status(404).json({ error: "Last login not found" });
        }
        res.status(200).json({message: "Last login retrieved successfully", last_login: last_login.data().last_login});
    } catch (error) {
        // console.error("Error getting last login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

/**
 * @route POST /last_login
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
 * "userId": "pgppaqcbqcbhqebkyuyxu"
 * }
 * Response:
 * {
 * "message": "Last login updated successfully"
 * }
 */
router.post("/update/last_login", async (req, res) => {
    try {
        const { userId } = req.body;
        if(!userId || userId === "") {
            return res.status(400).json({ error: "User ID is required" });
        }
        const userRef = await db.collection("users").doc(userId).get();
        if(!userRef.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        const last_login = {
            last_login: admin.firestore.FieldValue.serverTimestamp(),
            username: userRef.data().username,
        }
        await db.collection("last_login").doc(userId).set(last_login);
        res.status(201).json({ message: "Last login updated successfully" });
    } catch (error) {
        // console.error("Error updating last login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
