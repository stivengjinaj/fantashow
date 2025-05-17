import { PaymentElement } from "@stripe/react-stripe-js";
import {useEffect, useState} from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import {Button, Form} from "react-bootstrap";

function CheckoutForm(props) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Store payment data in localStorage for retrieval after redirect
    const storePaymentData = (uid, paymentIntentId) => {
        localStorage.setItem('stripe_payment_uid', uid);
        localStorage.setItem('stripe_payment_intent_id', paymentIntentId);
    };

    useEffect(() => {
        // If we have uid from props, store it immediately
        // This ensures it's available in case of redirects
        if (props.uid) {
            localStorage.setItem('stripe_payment_uid', props.uid);
        }
    }, [props.uid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!stripe || !elements) return;

        setIsProcessing(true);

        try {
            // ✅ Validate PaymentElement fields first
            const { error: validationError } = await elements.submit();

            if (validationError) {
                setErrorMessage(validationError.message);
                setIsProcessing(false);
                return; // 🔒 Prevent submission
            }

            // Proceed only if validation passed
            if (props.uid) {
                storePaymentData(props.uid, '');
            }

            const { paymentIntent, error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success`,
                },
                redirect: "if_required",
            });

            if (error) {
                console.error("Payment error:", error);
                setErrorMessage(error.message || "An error occurred during payment processing.");

                navigate("/checkout/error", {
                    state: {
                        fromCheckout: true,
                        uid: props.uid,
                        errorMessage: error.message || "Unknown error during payment.",
                        errorCode: error.code || null
                    }
                });
            } else if (paymentIntent?.status === "succeeded") {
                storePaymentData(props.uid, paymentIntent.id);
                navigate("/checkout/success", {
                    state: {
                        fromCheckout: true,
                        paymentIntentId: paymentIntent.id,
                        uid: props.uid
                    }
                });
            }
        } catch (err) {
            console.error("Exception during payment processing:", err);
            setErrorMessage("A system error occurred. Please try again later.");
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <Form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />

            {errorMessage && (
                <div className="alert alert-danger mt-3">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                variant="dark"
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                className="mt-3"
            >
                <span id="button-text">
                    {isProcessing ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                        </>
                    ) : (
                        "Paga"
                    )}
                </span>
            </Button>
        </Form>
    );
}

export default CheckoutForm;