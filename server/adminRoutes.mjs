import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
import {generateReferralCode, verifyAdmin, verifyToken} from "./utils.mjs";

dotenv.config();

const adminRoutes = express.Router();

adminRoutes.use(express.json());
adminRoutes.use(express.urlencoded({ extended: true }));

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

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
adminRoutes.post("/api/register/admin", async (req, res) => {
    try {
        const { name, surname, username, email, existingAdminUUID } = req.body;
        if(!username || !email || !name || !surname || username === "" || email === "" || name === "" || surname === "") {
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
        const referralCode = await generateReferralCode(name);

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
 * @route GET /api/admin/:uid
 * @description Retrieves admin details based on the provided UID.
 * @param {object} req - The HTTP request object.
 * @param {object} req.params - The request parameters.
 * @param {string} req.params.uid - The UID of the admin to retrieve.
 * @param {object} res - The HTTP response object.
 * @returns {object} - JSON response containing the admin details or an error message.
 * @returns {200} - If the admin is retrieved successfully.
 * @returns {400} - If the UID is missing from the request parameters.
 * @returns {404} - If the admin is not found in the database.
 * @returns {403} - If the user is not an admin.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * GET /api/admin/12345
 *
 * Successful Response:
 * {
 *   "message": "Admin retrieved successfully",
 *   "user": {
 *     "username": "admin_user",
 *     "email": "admin@example.com",
 *     "isAdmin": true,
 *     "createdAt": "2023-10-01T12:00:00Z"
 *   }
 * }
 *
 * Error Response (Admin not found):
 * {
 *   "error": "Admin not found"
 * }
 */
adminRoutes.get("/api/admin/:uid", verifyToken, async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        const adminRef = db.collection("users").doc(uid);
        const adminDoc = await adminRef.get();

        if (!adminDoc.exists) {
            return res.status(404).json({ error: "Admin not found" });
        }

        const adminData = adminDoc.data();

        if (!adminData.isAdmin) {
            return res.status(403).json({ error: "User is not an admin" });
        }

        res.status(200).json({
            message: "Admin retrieved successfully",
            user: adminData
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route GET /api/admin/all-users/:uid
 * @description Retrieves all non-admin users from the database.
 * @param {object} req - The HTTP request object.
 * @param {object} req.user - The authenticated user object.
 * @param {string} req.user.uid - The UID of the authenticated admin user.
 * @param {object} res - The HTTP response object.
 * @returns {object} - JSON response containing a list of non-admin users or an error message.
 * @returns {200} - If the users are retrieved successfully.
 * @returns {400} - If the UID is missing from the authenticated user object.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * GET /api/admin/all-users/admin123
 *
 * Successful Response:
 * {
 *   "message": "Users retrieved successfully",
 *   "users": [
 *     {
 *       "id": "user1",
 *       "username": "john_doe",
 *       "email": "john.doe@example.com",
 *       "isAdmin": false,
 *       "createdAt": "2023-10-01T12:00:00Z"
 *     },
 *     {
 *       "id": "user2",
 *       "username": "jane_doe",
 *       "email": "jane.doe@example.com",
 *       "isAdmin": false,
 *       "createdAt": "2023-10-02T12:00:00Z"
 *     }
 *   ]
 * }
 *
 * Error Response (Missing UID):
 * {
 *   "error": "UID is required"
 * }
 *
 * Error Response (Internal Server Error):
 * {
 *   "error": "Internal Server Error"
 * }
 */
adminRoutes.get("/api/admin/all-users/:uid", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const usersCollection = await db.collection("users").get();

        const users = usersCollection.docs
            .filter(doc => !doc.data().isAdmin)
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        res.status(200).json({
            message: "Users retrieved successfully",
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * @route PATCH /api/admin/edit-user/:adminUid
 * @description Updates the details of a user in the database.
 * @param {object} req - The HTTP request object.
 * @param {object} req.params - The request parameters.
 * @param {string} req.params.uid - The UID of the admin making the request.
 * @param {object} req.body - The request body containing the user details to update.
 * @param {string} req.body.uid - The UID of the user to be updated (required).
 * @param {object} req.body.updatedFields - The fields to update for the user.
 * @param {object} res - The HTTP response object.
 * @returns {object} - JSON response with a success message or an error message.
 * @returns {200} - If the user is updated successfully.
 * @returns {400} - If the user UID is missing in the request body.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * PATCH /api/admin/edit-user/admin123
 * Body:
 * {
 *   "uid": "user456",
 *   "username": "new_username",
 *   "email": "new_email@example.com"
 * }
 *
 * Successful Response:
 * {
 *   "success": true,
 *   "message": "User updated successfully"
 * }
 *
 * Error Response (Missing UID):
 * {
 *   "error": "User UID is required in the body"
 * }
 *
 * Error Response (Internal Server Error):
 * {
 *   "error": "Failed to update user"
 * }
 */
adminRoutes.patch("/api/admin/edit-user/:uid", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id: targetUid, ...updatedFields } = req.body;

        if (!targetUid) {
            return res.status(400).json({ error: "Target user UID is required in the body" });
        }

        const allowedFields = ["name", "points", "isAdmin", "paid"];
        const invalidFields = Object.keys(updatedFields).filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(", ")}` });
        }
        const userRef = admin.firestore().collection("users").doc(targetUid);
        await userRef.update(updatedFields);

        return res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({ error: "Failed to update user" });
    }
});



export default adminRoutes;