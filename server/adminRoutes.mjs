import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
import {generateReferralCode, verifyToken} from "./utils.mjs";

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

export default adminRoutes;