import {Elements} from "@stripe/react-stripe-js";
import {useEffect, useState} from "react";
import {fetchClientSecret} from "../../API.js";
import {stripePromise} from "../../utils/stripe.js";
import CheckoutForm from "./CheckoutForm.jsx";
import {Button, Col, Container, Row, Spinner} from "react-bootstrap";

const Checkout = (props) => {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        fetchClientSecret(clientSecret).then(r => setClientSecret(r));
    }, []);

    return (
        <Container fluid className="d-flex flex-column align-items-center justify-content-center">
            <h2 className="text-light text-center mt-5 mb-2">Pagamento</h2>
            <Button className="bg-success text-white px-3 py-2 rounded-2 my-4" onClick={props.prevStep} >
                Cambia metodo di pagamento
            </Button>
            <Container>
                <Row className="g-4">
                    {/* Left Container - Payment Form */}
                    <Col lg={7} md={12} className="mb-4 mb-lg-0">
                        <Container className="bg-light p-4 p-md-5 rounded-4 h-100 shadow">
                            <h3 className="mb-4">Metodo di Pagamento</h3>
                            {
                                (stripePromise && clientSecret)
                                    ? (<Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm uid={props.uid}/>
                                        </Elements>)
                                    : (<Container fluid className="d-flex justify-content-center">
                                        <Spinner animation="border" variant="primary" />
                                    </Container>)
                            }
                        </Container>
                    </Col>

                    {/* Right Container - Payment Summary */}
                    <Col lg={5} md={12}>
                        <div className="bg-light p-4 p-md-5 rounded-4 h-100 shadow">
                            <h3 className="mb-4">Riepilogo Pagamento</h3>

                            <div className="border-bottom pb-3 mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Costo Torneo</span>
                                    <span className="fw-bold">€40.00</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Commissioni di servizio</span>
                                    <span className="fw-bold">€1.75</span>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-3 border-bottom">
                                <span className="h5">Totale</span>
                                <span className="h5">€41.75</span>
                            </div>

                            <div className="mt-4 pt-3">
                                <div className="d-flex align-items-center mb-1">
                                    <i className="bi bi-shield-check me-2"></i>
                                    <small>Pagamento sicuro tramite Stripe</small>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
};

export default Checkout;
