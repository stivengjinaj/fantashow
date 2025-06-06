import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
import {verifyAdmin, verifyToken} from "./utils.mjs";

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
        const { paymentId } = req.body;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        if (!paymentId) {
            return res.status(400).json({ error: "Payment ID is required" });
        }

        await db.runTransaction(async (transaction) => {
            const userDocRef = db.collection("users").doc(uid);
            const userDoc = await transaction.get(userDocRef);

            if (!userDoc.exists) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const referredBy = userData.referredBy;

            const paymentDate = admin.firestore.FieldValue.serverTimestamp();

            transaction.update(userDocRef, {
                coins: admin.firestore.FieldValue.increment(20),
                paymentId,
                paymentDate
            });

            if (referredBy) {
                const referrerQuery = await db.collection("users")
                    .where("referralCode", "==", referredBy)
                    .limit(1)
                    .get();

                if (!referrerQuery.empty) {
                    const referrerDoc = referrerQuery.docs[0];
                    const referrerDocRef = referrerDoc.ref;
                    const referrerData = referrerDoc.data();

                    const pointsToAdd = referrerData.status === 0
                        ? 50
                        : referrerData.status === 1
                            ? 75
                            : 100;

                    transaction.update(referrerDocRef, {
                        points: admin.firestore.FieldValue.increment(pointsToAdd)
                    });
                } else {
                    throw new Error("Referrer not found for referralCode: " + referredBy);
                }
            } else {
                throw new Error("No referral code provided by user.");
            }
        });

        return res.status(200).json({ message: "Payment and referral update successful" });

    } catch (error) {
        console.error("Error in transaction:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
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
 * @route PATCH /api/cash-payment/:uid
 * @description Updates the paid status of a cash payment request for a user.
 * @param {string} req.body.cashId - The ID of the cash payment request to be updated.
 * @param {boolean} req.body.paid - The new paid status of the cash payment request.
 * @returns {object} - JSON response indicating the success or failure of the operation.
 * @returns {200} - If the cash payment request is updated successfully.
 * @returns {400} - If the cashId or paid status is missing from the request.
 * @returns {404} - If the cash payment request is not found.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * PATCH /api/cash-payment/12345
 * Body:
 * {
 *   "cashId": "12345",
 *   "paid": true
 * }
 *
 * Response (Success):
 * {
 *   "message": "Cash payment request updated successfully"
 * }
 *
 * Response (Not Found):
 * {
 *   "error": "Cash payment request not found"
 * }
 */
paymentRoutes.patch("/api/cash-payment/:uid", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { cashId, paid } = req.body;

        if (!cashId) {
            return res.status(400).json({ error: "UID is required" });
        }

        if (paid === undefined) {
            return res.status(400).json({ error: "Paid status is required" });
        }

        const cashPaymentRef = db.collection("cash_payments").doc(cashId);
        const cashPaymentDoc = await cashPaymentRef.get();

        if (!cashPaymentDoc.exists) {
            return res.status(404).json({ error: "Cash payment request not found" });
        }

        const batch = db.batch();

        batch.update(cashPaymentRef, { paid });

        const userRef = db.collection("users").doc(cashId);
        batch.update(userRef, { paid });

        await batch.commit();

        return res.status(200).json({
            message: "Cash payment request and user status updated successfully"
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route PATCH /api/cash-payment/all/:uid
 * @description Updates the paid status of multiple cash payment requests for a user.
 * @param {string} req.params.uid - The UID of the user whose cash payment requests are to be updated.
 * @param {boolean} req.body.paid - The new paid status to be applied to the selected cash payment requests.
 * @param {string[]} req.body.paymentIds - An array of payment IDs to be updated.
 * @returns {object} - JSON response indicating the success or failure of the operation.
 * @returns {200} - If the cash payment requests are updated successfully.
 * @returns {400} - If the UID, paid status, or payment IDs array is missing or invalid.
 * @returns {500} - If an internal server error occurs.
 * @async
 * @example
 * Request:
 * PATCH /api/cash-payment/all/12345
 * Body:
 * {
 *   "paid": true,
 *   "paymentIds": ["payment1", "payment2", "payment3"]
 * }
 *
 * Response (Success):
 * {
 *   "message": "Selected cash payment requests updated successfully"
 * }
 */
paymentRoutes.patch("/api/cash-payment/all/:uid", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const {uid} = req.params;
        const {paid, paymentIds} = req.body;

        if (!uid) {
            return res.status(400).json({error: "UID is required"});
        }

        if (paid === undefined) {
            return res.status(400).json({error: "Paid status is required"});
        }

        if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
            return res.status(400).json({error: "Payment IDs array is required"});
        }

        const batch = db.batch();
        paymentIds.forEach((paymentId) => {
            const cashPaymentRef = db.collection("cash_payments").doc(paymentId);
            batch.update(cashPaymentRef, {paid});
        });

        await batch.commit();

        return res.status(200).json({message: "Selected cash payment requests updated successfully"});
    } catch (error) {
        console.error("Error updating cash payment request:", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
})


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