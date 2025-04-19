import {useContext, useEffect, useState} from "react";
import {UserContext} from "../Contexts/UserContext.jsx";
import PaymentMethod from "../Registration/PaymentMethod.jsx";
import Checkout from "../Checkout/Checkout.jsx";
import {Container, Spinner} from "react-bootstrap";


function DashboardPayment(props) {
    const [ cardPayment, setCardPayment ] = useState(false);
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, [user])

    if (loading || !user) {
        return (
            <Container fluid className="p-0">
                <Container fluid className="min-vh-100 d-flex flex-column justify-content-center align-items-center dashboard-bg">
                    <Spinner variant="light" animation="border" />
                </Container>
            </Container>
        );
    }

    return (
        cardPayment
            ? (
                <Container fluid className="p-0 dashboard-bg">
                    <Checkout prevStep={() => setCardPayment(false)} uid={user.uid} />
                </Container>
            )
            : <PaymentMethod title={props.title} uid={user.uid} nextStep={() => setCardPayment(true)}/>
    );
}

export default DashboardPayment;