import {Container} from "react-bootstrap";

function Error() {
    return (
        <Container fluid className="min-vh-100 d-flex flex-column justify-content-start align-items-center dashboard-bg">
            <h2 className="mt-5 text-danger">Qualcosa è andato storto.</h2>
            <h4 className="mt-3 text-light">Ti preghiamo di riprovare più tardi.</h4>
        </Container>
    );
}

export default Error;