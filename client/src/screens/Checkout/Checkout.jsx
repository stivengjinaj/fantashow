import {Elements} from "@stripe/react-stripe-js";
import {useEffect, useState} from "react";
import {fetchClientSecret} from "../../API.js";
import {stripePromise} from "../../utils/stripe.js";
import CheckoutForm from "./CheckoutForm.jsx";
import {Col, Container, Row, Spinner} from "react-bootstrap";

const CheckoutPage = () => {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        fetchClientSecret(clientSecret).then(r => setClientSecret(r));
    }, []);

    return (
        <Container fluid className="d-flex flex-column align-items-center justify-content-center">
            <h2 className="text-light text-center mt-5 mb-5">Pagamento</h2>

            <Container>
                <Row className="g-4">
                    {/* Left Container - Payment Form */}
                    <Col lg={7} md={12} className="mb-4 mb-lg-0">
                        <Container className="bg-light p-4 p-md-5 rounded-4 h-100 shadow">
                            <h3 className="mb-4">Metodo di Pagamento</h3>
                            {
                                (stripePromise && clientSecret)
                                    ? (<Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm />
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
                                    <span>Subtotale</span>
                                    <span className="fw-bold">€XX.XX</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>IVA (22%)</span>
                                    <span className="fw-bold">€XX.XX</span>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mt-3">
                                <span className="h5">Totale</span>
                                <span className="h5">€XX.XX</span>
                            </div>

                            <div className="mt-4 pt-3 border-top">
                                <div className="d-flex align-items-center mb-1">
                                    <i className="bi bi-shield-check me-2"></i>
                                    <small>Pagamento sicuro tramite Stripe</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <small>Riceverai la conferma via email</small>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
};

export default CheckoutPage;
