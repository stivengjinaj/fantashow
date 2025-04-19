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
const verifyPayment = async (req, res, next) => {
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
router.post("/api/delete-user", async (req, res) => {
    const { uid } = req.body;

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

/**
 * @route GET /api/cash-payment/:uid
 * @description Retrieves a cash payment request for a user based on their UID.
 * @param {string} req.params.uid - The UID of the user whose cash payment request is to be retrieved.
 * @returns {object} - JSON response indicating the success or failure of the operation.
 * @returns {200} - If the cash payment request is found.
 * @returns {400} - If the UID is missing from the request.
 * @returns {404} - If the cash payment request is not found.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * GET /api/cash-payment/pgppaqcbqcbhqebkyuyxu
 *
 * Response (Success):
 * {
 *   "message": "Cash payment request found"
 * }
 *
 * Response (Not Found):
 * {
 *   "error": "Cash payment request not found"
 * }
 */
router.get("/api/cash-payment/:uid", verifyToken, async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        const checkExistingRequestRef = db.collection("cash_payments").doc(uid);
        const checkExistingRequestDoc = await checkExistingRequestRef.get();

        if (!checkExistingRequestDoc.exists) {
            return res.status(404).json({ error: "Cash payment request not found" });
        }

        return res.status(200).json({ message: "Cash payment request found" })

    }catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

/**
 * @route POST /api/cash-payment
 * @description Registers a cash payment request for a user.
 * @param {object} req.body.uid - The UID of the user requesting the cash payment.
 * @returns {object} - JSON response with a success message.
 * @returns {201} - If the cash payment request is registered successfully.
 * @returns {400} - If the UID is missing.
 * @returns {402} - If a request already exists for the given UID.
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
 * "message": "Cash payment request registered"
 * }
 */
router.post("/api/cash-payment", async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        const checkExistingRequestRef = db.collection("cash_payments").doc(uid);
        const checkExistingRequestDoc = await checkExistingRequestRef.get();

        if (checkExistingRequestDoc.exists) {
            return res.status(402).json({ error: "Request already exists" });
        }

        const newCashPayment = {
            requestDate: admin.firestore.FieldValue.serverTimestamp(),
            paid: false
        };

        await db.collection("cash_payments").doc(uid).set(newCashPayment);

        return res.status(201).json({ message: "Cash payment request registered" });
    } catch (error) {
        console.error("Error registering cash payment:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * @route DELETE /api/cash_payment/:uid
 * @description Deletes a cash payment request for a user based on their UID.
 * @param {string} req.params.uid - The UID of the user whose cash payment request is to be deleted.
 * @returns {object} - JSON response with a success message.
 * @returns {200} - If the cash payment request is deleted successfully.
 * @returns {400} - If the UID is missing.
 * @returns {404} - If the cash payment request is not found.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * DELETE /api/cash_payment/pgppaqcbqcbhqebkyuyxu
 *
 * Response:
 * {
 * "message": "Cash payment request deleted successfully"
 * }
 */
router.delete("/api/cash-payment/:uid", async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        const cashPaymentRef = db.collection("cash_payments").doc(uid);
        const cashPaymentDoc = await cashPaymentRef.get();

        if (!cashPaymentDoc.exists) {
            return res.status(404).json({ error: "Cash payment request not found" });
        }

        await cashPaymentRef.delete();

        return res.status(200).json({ message: "Cash payment request deleted successfully" });
    } catch (error) {
        console.error("Error deleting cash payment request:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route POST /api/support
 * @description Handles support requests submitted by users.
 * @param {object} req.body - The request body containing support request details.
 * @param {string} req.body.supportMode - The mode of support requested (either "email" or "telegram").
 * @param {string} [req.body.name] - The name of the user (required if supportMode is "email").
 * @param {string} [req.body.email] - The email of the user (required if supportMode is "email").
 * @param {string} [req.body.telegram] - The Telegram username of the user (required if supportMode is "telegram").
 * @param {string} req.body.description - The description of the support request.
 * @returns {object} - JSON response with a success message.
 * @returns {201} - If the support request is submitted successfully.
 * @returns {400} - If support mode is unknown.
 * @returns {401} - If required field are missing
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request Body:
 * {
 * "supportMode": "email",
 * "name": "John Doe",
 * "email": "john.doe@example.com",
 * "description": "I need help with my account."
 * }
 *
 * Response:
 * {
 * "message": "Support request submitted successfully."
 * }
 */
router.post("/api/support", async (req, res) => {
    try {
        const { supportMode, name, email, telegram, description } = req.body;

        if (supportMode !== "email" && supportMode !== "telegram") {
            return res.status(400).json({ error: "Support mode unknown" });
        }

        const supportData = {
            supportMode: supportMode,
            description,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (supportMode === "email") {
            if (!name || !email) {
                return res.status(401).json({ error: "Name and email are required for email support." });
            }
            supportData.name = name;
            supportData.email = email;
        } else if (supportMode === "telegram") {
            if (!telegram) {
                return res.status(401).json({ error: "Telegram username is required for Telegram support." });
            }
            supportData.telegram = telegram;
        }

        await db.collection("support").add(supportData);

        return res.status(201).json({ message: "Support request submitted successfully." });
    } catch (error) {
        console.error("Error handling support request:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route GET /api/referral/:referralCode
 * @description Checks if a referral code exists and retrieves the name of the user associated with it.
 * @param {string} req.params.referralCode - The referral code to check.
 * @returns {object} - JSON response with the name of the user associated with the referral code.
 * @returns {200} - If the referral code exists and the user is found.
 * @returns {400} - If the referral code is missing.
 * @returns {401} - If the referral code does not exist.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * GET /api/referral/abc123
 *
 * Response:
 * {
 * "referralUser": "John Doe"
 * }
 */
router.get("/api/referral/:referralCode", async (req, res) => {
    try {
        const { referralCode } = req.params;

        if(!referralCode){
            return res.status(400).json({ error: "Referral code required" });
        }

        const referralUser = await db.collection("users")
            .where("referralCode", "==", referralCode)
            .get();

        if(referralUser.empty) {
            return res.status(401).json({ error: "Referral code does not exist" });
        }

        return res.status(200).json({ referralUser: referralUser.docs[0].get("name")});
    }catch (error){
        return res.status(500).json({ error: "Internal Server Error" });
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
router.get("/api/user/:uuid", verifyToken, verifyPayment, async (req, res) => {
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



export default router;
