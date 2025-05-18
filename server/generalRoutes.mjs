import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";
import rateLimit from "express-rate-limit"
import {verifyPayment, verifyToken} from "./utils.mjs";

dotenv.config();

const generalRoutes = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

generalRoutes.use(express.json({ limit: '10kb' }));
generalRoutes.use(express.urlencoded({ extended: true, limit: '10kb' }));
generalRoutes.use(limiter);


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

        if (!supportMode || !name || !description) {
            return res.status(401).json ({ error: "Missing data"})
        }

        const normalizedSupportMode = supportMode.toString().toLowerCase();
        if (normalizedSupportMode !== "email" && normalizedSupportMode !== "telegram") {
            return res.status(400).json({ error: "Support mode unknown" });
        }

        const supportData = {
            supportMode: supportMode,
            solved: false,
            description,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (normalizedSupportMode === "email") {
            if (!name || !email) {
                return res.status(401).json({ error: "Name and email are required for email support." });
            }else {
                supportData.name = name;
                supportData.email = email;
            }
        } else if (normalizedSupportMode === "telegram") {
            if (!telegram) {
                return res.status(401).json({ error: "Telegram username is required for Telegram support." });
            }
            supportData.telegram = telegram;
        } else {
            return res.status(400).json({ error: "Support mode unknown" });
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

        const referrerData = referralUser.docs[0].data();

        if(!referrerData.paid && !referrerData.isAdmin){
            return res.status(401).json({ error: "Referral code does not exist" });
        }

        return res.status(200).json({ referralUser: referralUser.docs[0].get("name")});
    }catch (error){
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route GET /api/user-subscriptions/:uuid
 * @description Retrieves the count of users created per month for specified months.
 * @param {string} req.params.uuid - The UUID of the user (used for token and payment validation).
 * @returns {object} - JSON response with counts of users created per month.
 * @returns {200} - If the data is successfully retrieved.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * GET /api/user-subscriptions/123e4567-e89b-12d3-a456-426614174000
 *
 * Response:
 * {
 *   "monthlyCounts": {
 *     "May": 10,
 *     "June": 5,
 *     "July": 8,
 *     "August": 12,
 *     "September": 6
 *   }
 * }
 */
generalRoutes.get("/api/user-subscriptions/:uuid", verifyToken, verifyPayment, async (req, res) => {
    try {
        const months_dictionary = {
            4: "Aprile",
            5: "Maggio",
            6: "Giugno",
            7: "Luglio",
            8: "Agosto",
            9: "Settembre"
        };

        const monthNames = Object.values(months_dictionary);
        const monthlyCounts = {};

        monthNames.forEach((month) => {
            monthlyCounts[month] = 0;
        });

        const userCollection = await db.collection("users").get();

        userCollection.docs.forEach((user) => {
            const userCreationDate = user.get("createdAt");

            if (userCreationDate && typeof userCreationDate.toDate === "function") {
                const userCreationMonth = userCreationDate.toDate().getMonth() + 1;
                const monthName = months_dictionary[userCreationMonth];

                if (monthName) {
                    monthlyCounts[monthName] += 1;
                }
            }
        });

        const formattedData = [];
        let lastValue = 0;

        for (const month of monthNames) {
            const currentValue = monthlyCounts[month];
            if (currentValue < lastValue) {
                monthlyCounts[month] = lastValue+1;
            } else {
                lastValue = currentValue;
            }

            formattedData.push({ month, value: monthlyCounts[month] });
        }
        return res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error processing user subscriptions:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route PATCH /api/team/:uuid
 * @description Updates the team information for a specific user in the database.
 * @access private - Requires valid token and payment verification.
 * @param {object} req - The HTTP request object.
 * @param {string} req.params.uuid - The UUID of the user whose team is being updated.
 * @param {object} req.body - The request body containing the team information.
 * @param {string} req.body.team - The new team information to update (required).
 * @param {object} res - The HTTP response object.
 * @returns {object} - JSON response with a success message or an error message.
 * @returns {200} - If the team is updated successfully.
 * @returns {400} - If the UUID or team is missing from the request.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * PATCH /api/team/123e4567-e89b-12d3-a456-426614174000
 * Body:
 * {
 *   "team": "Development"
 * }
 *
 * Successful Response:
 * {
 *   "message": "Team updated successfully"
 * }
 *
 * Error Response (Missing Fields):
 * {
 *   "error": "UUID and team are required"
 * }
 *
 * Error Response (Internal Server Error):
 * {
 *   "error": "Internal Server Error"
 * }
 */
generalRoutes.patch("/api/team/:uuid", verifyToken, verifyPayment, async (req, res) => {
    try {
        const { uuid } = req.params;
        const { team } = req.body;

        if (!uuid || !team) {
            return res.status(400).json({ error: "UUID and team are required" });
        }

        const formattedTeam = team.includes(' ')
            ? team.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : team.toUpperCase();

        const userRef = db.collection("users").doc(uuid);
        await userRef.update({team: formattedTeam});

        return res.status(200).json({ message: "Team updated successfully" });
    } catch (error) {
        console.error("Error updating team:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

generalRoutes.get("/api/user/statistics/:uuid", verifyToken, verifyPayment, async (req, res) => {
    try {
        const { uuid } = req.params;

        if (!uuid) {
            return res.status(400).json({ error: "UUID is required" });
        }

        const userCollection = db.collection("users");

        const userQuery = userCollection
            .where("isAdmin", "==", false)
            .orderBy("points", "desc")
            .limit(5)
            .select("username", "points", "team", "favouriteTeam")

        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            return res.status(404).json({ error: "No users found" });
        }

        const userStatistics = userSnapshot.docs.map((doc) => ({
            username: doc.get("username"),
            points: doc.get("points"),
            team: doc.get("team"),
            favouriteTeam: doc.get("favouriteTeam"),
        }));

        return res.status(200).json({ message: userStatistics });
    } catch (error) {
        console.error("Error retrieving user statistics:", error.message, error.stack); // Improved logging
        return res.status(500).json({ error: "Internal Server Error" });
    }
})


export default generalRoutes;