import {Container} from "react-bootstrap";

function NotFound() {
    return (
        <Container fluid className="animated-bg d-flex justify-content-center align-items-center min-vh-100">
            <Container className="text-center">
                <h2 className="text-light">404: Non Trovata</h2>
            </Container>
        </Container>
    );
}

export default NotFound;