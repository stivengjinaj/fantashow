import {Button, Container} from "react-bootstrap";
import {useNavigate} from "react-router";

function SupportSuccess() {
    const navigate = useNavigate();
    return (
        <Container fluid className="d-flex flex-column justify-content-center align-items-center">
            <h3 className="text-light text-center mt-5">Ticket inviato con successo</h3>
            <h4 className="text-light text-center mt-4">Il team di supporto ha ricevuto il tuo ticket. <br/>Ti risponderemo il prima possibile</h4>
            <Button onClick={() => navigate("/")} className="outlined-orange-button rounded-3 mt-4">
                Home
            </Button>
        </Container>
    );
}

export default SupportSuccess;