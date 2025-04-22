import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { deleteCashPaymentRequest, verifyPayment, insertTransactionId } from "../../API.js";
import { Spinner } from "react-bootstrap";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVerified, setIsVerified] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);

    useEffect(() => {
        const processPayment = async () => {
            try {
                await verifyPayment(
                    () => navigate("/"),
                    () => {
                        setIsVerified(true);
                    },
                    location.state?.paymentIntentId,
                    location.state?.uid
                );

                await deleteCashPaymentRequest(location.state.uid);
                console.log(location.state.paymentIntentId);
                if (location.state?.paymentIntentId && location.state?.uid ) {
                    const result = await insertTransactionId(
                        location.state.uid,
                        location.state.paymentIntentId
                    );

                    setTransactionStatus(result.success ? 'success' : 'error');

                    if (!result.success) {
                        console.error("Failed to insert transaction ID:", result.error);
                    }
                }
            } catch (error) {
                console.error("Error processing payment:", error);
                setTransactionStatus('error');
            }
        };

        processPayment();
    }, [location, navigate]);

    return (
        isVerified
            ? (<div className="container py-5">
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
                            <button className="btn btn-primary px-4" onClick={() => window.location.href = "/login"}>
                                Accedi
                            </button>
                        </div>
                    </div>
                </div>
            </div>)
            : (<Spinner variant="light" animation="border" />)
    );
};

export default PaymentSuccess;