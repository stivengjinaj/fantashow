import {useLocation, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {verifyPayment} from "../../API.js";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        /*if (!location.state?.fromCheckout) {
            navigate("/");
        }*/
        verifyPayment(
            () => navigate("/"),
            () => setIsVerified(true),
            location.state?.paymentIntentId
        );
    }, [location, navigate]);

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="bg-light p-4 rounded-4 text-center shadow">
                        <div className="mb-4">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h2 className="mb-3">Pagamento Completato 🎉</h2>
                        <p className="mb-4">Riceverai a breve una email di conferma.</p>
                        <button className="btn btn-primary px-4" onClick={() => window.location.href = "/login"}>
                            Accedi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;