import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
import {verifyToken} from "./utils.mjs";

dotenv.config();

const paymentRoutes = express.Router();

paymentRoutes.use(express.json());
paymentRoutes.use(express.urlencoded({ extended: true }));

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

/**
 * @route PATCH /api/card-payment/:uid
 * @description Updates the payment ID for a user based on their UID.
 * @param {string} req.params.uid - The UID of the user whose payment ID is to be updated.
 * @param {string} req.body.paymentId - The new payment ID to be associated with the user.
 * @returns {object} - JSON response indicating the success or failure of the operation.
 * @returns {200} - If the payment ID is updated successfully.
 * @returns {400} - If the UID or payment ID is missing from the request.
 * @returns {404} - If the user is not found in the database.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * PATCH /api/card-payment/12345
 * Body:
 * {
 *   "paymentId": "new-payment-id-67890"
 * }
 *
 * Response (Success):
 * {
 *   "message": "Payment ID updated successfully"
 * }
 *
 * Response (User Not Found):
 * {
 *   "error": "User not found"
 * }
 */
paymentRoutes.patch("/api/card-payment/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        console.log(uid);
        const { paymentId } = req.body;
        console.log(paymentId);
        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        if (!paymentId) {
            return res.status(400).json({ error: "Payment ID is required" });
        }

        const userDocRef = db.collection("users").doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        await userDocRef.update({ paymentId });

        return res.status(200).json({message: "Payment ID updated successfully"});
    }catch (error) {
        return res.status(500).json({error: error.message || "Internal Server Error"});
    }
})

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
paymentRoutes.get("/api/cash-payment/:uid", verifyToken, async (req, res) => {
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
paymentRoutes.post("/api/cash-payment", async (req, res) => {
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
paymentRoutes.delete("/api/cash-payment/:uid", async (req, res) => {
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

export default paymentRoutes;