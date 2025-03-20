import {Button} from "react-bootstrap";
import {useNavigate} from "react-router";
import {useEffect} from "react";
import {deleteCashPaymentRequest, registerCashPaymentRequest} from "../../API.js";


function CashCheckout(props) {
    const navigate = useNavigate();

    useEffect(() => {
        async function paymentRequest() {
            if (props.uid) {
                await registerCashPaymentRequest(props.uid);
            }
        }
        paymentRequest();
    }, [props.uid]);

    const deleteCashRequest = async () => {
        if(props.uid){
            await deleteCashPaymentRequest(props.uid);
            props.changePaymentMethod();
        }
    }

    return (
        <div className="animated-bg min-vh-100 d-flex flex-column justify-content-center align-items-center p-4">
            <div className="bg-white rounded-4 shadow p-4 p-md-5 text-center cash-payment-container" style={{maxWidth: "600px"}}>
                {/* Header */}
                <div className="mb-4">
                    <h2 className="fw-bold">Pagamento in Contanti</h2>
                    <div className="d-flex justify-content-start my-3">
                        <Button className="bg-success text-white px-3 py-2 rounded-2" onClick={deleteCashRequest}>
                            Cambia metodo di pagamento
                        </Button>
                    </div>
                </div>

                {/* Steps */}
                <div className="text-start mb-4">
                    <h4 className="mb-3">Ecco i passaggi da seguire:</h4>
                    <ol className="list-group list-group-numbered mb-4">
                        <li className="list-group-item border-0">Fissare un appuntamento con un responsabile.</li>
                        <li className="list-group-item border-0">Effettuare il pagamento in contanti.</li>
                        <li className="list-group-item border-0">Accedere al tuo account Fantashow.</li>
                        <li className="list-group-item border-0">Controllare se il tuo account è stato attivato.</li>
                    </ol>

                    <div className="alert alert-info" role="alert">
                        <i className="bi bi-info-circle me-2"></i>
                        Una volta effettuato il pagamento il tuo account verrà attivato.
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                    <Button className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold" onClick={() => navigate("/login")}>
                        Accedi
                        <i className="bi bi-arrow-right-circle ms-2"></i>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default CashCheckout;