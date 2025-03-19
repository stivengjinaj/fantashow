import express from "express";
import dotenv from "dotenv";
import Stripe from 'stripe';

dotenv.config();

const checkoutRoutes = express.Router();

checkoutRoutes.use(express.json());

const clientLink = "http://localhost:5173";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

checkoutRoutes.post('/create-payment-intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000,
            currency: 'eur',
            payment_method_types: ['card'],
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

checkoutRoutes.post("/verify-payment", async (req, res) => {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
        return res.status(400).json({ success: false, error: "Missing paymentIntentId" });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
            return res.json({ success: true });
        } else {
            return res.status(400).json({ success: false, error: "Payment not completed" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

export default checkoutRoutes;
