import {Button, Col, Container, Image, Row} from "react-bootstrap";
import cashIcon from "../../assets/icons/cash.svg";
import creditCardIcon from "../../assets/icons/creditCard_icon.svg";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {useState} from "react";
import CashCheckout from "./CashCheckout.jsx";
import {logout} from "../../utils/auth.js";
import {breakLine} from "../../utils/helper.js";

function PaymentMethod({nextStep, uid, title}) {
    const [cashPayment, setCashPayment] = useState(false);

    useGSAP(() => {
        gsap.from(".payment-method-column", {
            y: 30,
            opacity: 0,
            yoyo: true,
        })
        gsap.from([".payment-method-title", ".cash-payment-container"], {
            x: -30,
            opacity: 0,
            yoyo: true,
        })
    }, [cashPayment]);

    const changePaymentMethod = () => {
        setCashPayment(!cashPayment);
    }

    return (
        cashPayment
            ? (
                <CashCheckout changePaymentMethod={changePaymentMethod} uid={uid}/>
            )
            : (
                <Container fluid className="animated-bg d-flex flex-column min-vh-100 justify-content-center align-items-center">
                    {
                        title
                            ?
                            <>
                                <h3 className="text-center text-light mb-2 payment-method-title">{breakLine(title)[0]}</h3>
                                <h3 className="text-center text-light mb-2 payment-method-title">{breakLine(title)[1]}</h3>
                                <h4 className="text-center mb-2" onClick={logout}><a className="text-danger" href="/login">Esci</a></h4>
                            </>
                            : <h2 className="text-center text-light mb-5 payment-method-title">Scegli il metodo di pagamento</h2>
                    }
                    <Row className="w-100 justify-content-center mt-5">
                        <Col md={3} className="d-flex flex-column align-items-center mx-2 mx-md-5 payment-method-column">
                            <Button className="p-5 rounded-5 text-dark border-0 payment-method-button" onClick={changePaymentMethod}>
                                <Image width={150} height={150} src={cashIcon} alt="cash"/>
                            </Button>
                            <h3 className="my-4 mt-md-4 my-sm-3 text-light fw-bold">Contanti</h3>
                        </Col>

                        <Col md={3} className="d-flex flex-column align-items-center mx-2 mx-md-5 payment-method-column">
                            <Button className="p-5 rounded-5 text-dark border-0 payment-method-button" onClick={nextStep}>
                                <Image width={150} height={150} src={creditCardIcon} alt="creditCard"/>
                            </Button>
                            <h3 className="my-3 mt-md-4 mt-sm-2 text-light fw-bold">Carte di pagamento</h3>
                        </Col>
                    </Row>
                </Container>
            )
    );
}

export default PaymentMethod;