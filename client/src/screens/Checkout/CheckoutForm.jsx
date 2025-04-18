import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import {Button, Form} from "react-bootstrap";

function CheckoutForm(props) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [message] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsProcessing(true);

        const { paymentIntent, error } = await stripe.confirmPayment({
            elements,
            redirect: "if_required"
        });

        if (!error && paymentIntent?.status === "succeeded") {
            navigate("/checkout/success", {
                state: {
                    fromCheckout: true,
                    paymentIntentId: paymentIntent.id,
                    uid: props.uid
                }
            });
        } else {
            navigate("/checkout/error", {
                state: {
                    fromCheckout: true,
                    uid: props.uid,
                    errorMessage: error?.message || "Unknown error during payment.",
                    errorCode: error?.code || null,
                    paymentIntentId: paymentIntent?.id || null
                }
            });
        }


        setIsProcessing(false);
    };

    return (
        <Form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <Button type="submit" variant={"dark"} disabled={isProcessing || !stripe || !elements} id="submit" className="mt-3">
                <span id="button-text">{isProcessing ? "Processing ... " : "Pay now"}</span>
            </Button>
            {message && <div id="payment-message">{message}</div>}
        </Form>
    );
}

export default CheckoutForm;