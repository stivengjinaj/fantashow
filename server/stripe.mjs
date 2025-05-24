import express from "express";
import dotenv from "dotenv";
import Stripe from 'stripe';
import admin from "firebase-admin";

dotenv.config();

const checkoutRoutes = express.Router();

checkoutRoutes.use(express.json());

const clientLink = "http://localhost:5173";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @route GET /api/create-payment-intent
 * @description Creates a new payment intent using Stripe API.
 * @async
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @returns {object} - JSON response containing the client secret for the payment intent.
 * @returns {500} - If an error occurs while creating the payment intent.
 * @example
 * Response:
 * {
 *   "clientSecret": "pi_1ExampleSecretKey"
 * }
 */
checkoutRoutes.get('/api/create-payment-intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 4175, // Amount in cents (e.g., 41.75 EUR)
            currency: 'eur',
            payment_method_types: ['card'],
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/verify-payment
 * @description Verifies the payment status of a given payment intent and updates the user's payment status in the database.
 * @async
 * @param {object} req - The HTTP request object.
 * @param {string} req.body.paymentIntentId - The ID of the payment intent to verify.
 * @param {string} req.body.uid - The unique ID of the user whose payment status needs to be updated.
 * @param {object} res - The HTTP response object.
 * @returns {object} - JSON response indicating the success or failure of the operation.
 * @returns {400} - If `paymentIntentId` or `uid` is missing
 * @returns {401} - If the payment intent status is not "succeeded".
 * @returns {404} - If the user is not found in the database.
 * @returns {500} - If a server error occurs during the process.
 * @example
 * Request Body:
 * {
 *   "paymentIntentId": "pi_1ExampleIntentId",
 *   "uid": "user123"
 * }
 *
 * Successful Response:
 * {
 *   "success": true,
 *   "message": "Payment verified and user updated."
 * }
 *
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Payment not completed"
 * }
 */
checkoutRoutes.post("/api/verify-payment", async (req, res) => {
    const { paymentIntentId, uid } = req.body;

    if (!paymentIntentId || !uid) {
        return res.status(400).json({ success: false, error: "Missing paymentIntentId or uid" });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
            const userRef = admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return res.status(404).json({ success: false, error: "User not found" });
            }

            await userRef.update({ paid: true });

            return res.json({ success: true, message: "Payment verified and user updated." });
        } else {
            return res.status(401).json({ success: false, error: "Payment not completed" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

export default checkoutRoutes;