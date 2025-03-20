import {Button, Container} from "react-bootstrap";
import Guide from "../misc/Guide.jsx";
import {useNavigate} from "react-router";


function PasswordResetSuccess() {
    const navigate = useNavigate();
    return (
        <Container fluid className="animated-bg">
            <Guide/>

            <Container fluid className="d-flex flex-column justify-content-center align-items-center mt-5">
                <h2 className="mt-5 main-title-margin text-light text-center">
                    Controlla la tua email
                </h2>

                <h4 className="text-light text-center mt-3">
                    Se l'indirizzo email specificato è corretto, è stata inviata un'email
                    <br/>  con un link per reimpostare la password.
                </h4>
                <Button className="outlined-orange-button border-2 rounded-3 mt-5" onClick={() => navigate("/")}>
                    Home
                </Button>
            </Container>
        </Container>
    );
}

export default PasswordResetSuccess;