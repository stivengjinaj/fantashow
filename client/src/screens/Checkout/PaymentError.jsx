import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";

function PaymentError() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!location.state || !location.state.uid || !location.state.errorMessage) {
            navigate("/");
        }
    }, [location, navigate]);


    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="bg-light p-4 rounded-4 text-center shadow">
                        <div className="mb-4">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h2 className="mb-3">Transazione rifiutata</h2>
                        <p className="mb-4">Controlla la tua email per verificare il tuo account. Dopo la verifica, accedi alla dashboard per completare il pagamento.</p>
                        <button className="btn btn-primary px-4" onClick={() => window.location.href = "/login"}>
                            Accedi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentError;