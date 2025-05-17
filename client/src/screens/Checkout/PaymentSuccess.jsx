import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { deleteCashPaymentRequest, verifyPayment, insertTransactionId } from "../../API.js";
import { Spinner } from "react-bootstrap";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVerified, setIsVerified] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if we're retrieving from URL params after a redirect
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntentFromUrl = urlParams.get('payment_intent');

        const processPayment = async () => {
            try {
                // Get payment data with fallbacks in this order:
                // 1. From location.state (direct navigation)
                // 2. From localStorage (after redirect)
                // 3. From URL parameters (direct return from Stripe)
                const paymentIntentId = location.state?.paymentIntentId ||
                    localStorage.getItem('stripe_payment_intent_id') ||
                    paymentIntentFromUrl;

                const uid = location.state?.uid ||
                    localStorage.getItem('stripe_payment_uid');

                // Validate we have the required data
                if (!paymentIntentId || !uid) {
                    console.error("Missing required payment data", { paymentIntentId, uid });
                    setError("Informazioni di pagamento mancanti. Per favore contatta il supporto.");
                    setIsLoading(false);
                    return;
                }

                // Process payment verification with error handling
                try {
                    await verifyPayment(
                        (verifyError) => {
                            console.error("Payment verification error:", verifyError);
                            setError("Si è verificato un errore durante la verifica del pagamento.");
                            setIsLoading(false);
                        },
                        () => {
                            setIsVerified(true);
                            // Continue with post-verification steps
                            handlePostVerification(uid, paymentIntentId);
                        },
                        paymentIntentId,
                        uid
                    );
                } catch (verifyError) {
                    console.error("Exception during payment verification:", verifyError);
                    setError("Si è verificato un errore durante la verifica del pagamento.");
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error in payment success flow:", error);
                setError("Si è verificato un errore durante il processo di pagamento");
                setIsLoading(false);
            }
        };

        const handlePostVerification = async (uid, paymentIntentId) => {
            try {
                // Delete cash payment request
                try {
                    await deleteCashPaymentRequest(uid);
                } catch (deleteError) {
                    console.warn("Error deleting cash payment request:", deleteError);
                    // Non-critical error, continue
                }

                // Insert transaction record
                try {
                    const result = await insertTransactionId(uid, paymentIntentId);
                    setTransactionStatus(result.success ? 'success' : 'error');

                    if (!result.success) {
                        console.error("Failed to insert transaction ID:", result.error);
                    }
                } catch (insertError) {
                    console.error("Error inserting transaction:", insertError);
                    setTransactionStatus('error');
                }
            } catch (error) {
                console.error("Error in post-verification processing:", error);
                setTransactionStatus('error');
            } finally {
                // Clean up localStorage
                localStorage.removeItem('stripe_payment_uid');
                localStorage.removeItem('stripe_payment_intent_id');
                setIsLoading(false);
            }
        };

        // Start processing
        processPayment();
    }, [location, navigate]);

    // Handle login redirect
    const handleLoginRedirect = () => {
        // Ensure clean state
        localStorage.removeItem('stripe_payment_uid');
        localStorage.removeItem('stripe_payment_intent_id');

        // Use window.location for a full page reload
        window.location.href = "/login";
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <Spinner variant="primary" animation="border" className="mb-3" />
                    <p>Concludendo il pagamento...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="bg-light p-4 rounded-4 text-center shadow">
                            <div className="mb-4">
                                <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h2 className="mb-3">
                                Errore durante il pagamento
                            </h2>
                            <p className="mb-4">{error}</p>
                            <button className="btn btn-primary px-4" onClick={handleLoginRedirect}>
                                Accedi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    return (
        isVerified ? (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="bg-light p-4 rounded-4 text-center shadow">
                            <div className="mb-4">
                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h2 className="mb-3">Pagamento Completato 🎉</h2>
                            <p className="mb-4">Riceverai a breve una email di conferma.</p>
                            {transactionStatus === 'error' && (
                                <p className="text-danger mb-3">
                                    Nota: C'è stato un problema nel salvare i dettagli della transazione.
                                    Per favore contatta il supporto.
                                </p>
                            )}
                            <button className="btn btn-primary px-4" onClick={handleLoginRedirect}>
                                Accedi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner variant="primary" animation="border" />
            </div>
        )
    );
};

export default PaymentSuccess;