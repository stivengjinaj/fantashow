import {Button, Container} from "react-bootstrap";
import {useNavigate} from "react-router";

function ReferralError() {
    const navigate = useNavigate();
    return (
        <Container fluid className="animated-error-bg">
            {/*Guide Button*/}
            <Container fluid className="d-flex justify-content-end">
                <Button className="blue-button px-5 mt-4 mx-3 fw-bold">
                    Guida
                </Button>
            </Container>

            {/*Error Title*/}
            <Container fluid className="d-flex flex-column align-items-center justify-content-center mt-5 pt-5">
                <h2 className="mt-5 main-title-margin text-light text-center pt-5">
                    Il link di referral non è valido
                </h2>
                <h4 className={"mt-3 text-light text-center"}>
                    Sembra che tu abbia seguito un link errato o scaduto. <br/>
                    <a style={{color: "#62C3ED"}} href={"/support"}>Contatta il nostro supporto</a> o <a style={{color: "#62C3ED"}} href={"/contact"}>richiedi un nuovo referral</a> per continuare.
                </h4>
            </Container>

            {/*Registration Button*/}
            <Container fluid className="d-flex justify-content-center mt-5">
                <Button className="blue-button mt-5 px-5 py-2" onClick={() => navigate("/")}>
                    Vai alla home
                </Button>
            </Container>
        </Container>
    );
}

export default ReferralError;