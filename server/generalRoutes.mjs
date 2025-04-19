import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const generalRoutes = express.Router();

generalRoutes.use(express.json());
generalRoutes.use(express.urlencoded({ extended: true }));

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();


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
generalRoutes.post("/api/support", async (req, res) => {
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
generalRoutes.get("/api/referral/:referralCode", async (req, res) => {
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

export default generalRoutes;