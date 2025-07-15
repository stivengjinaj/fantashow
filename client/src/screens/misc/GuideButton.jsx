import {Button, Container} from "react-bootstrap";


function GuideButton() {
    const handleNavigation = (event) => {
        event.preventDefault();
        window.location.href = '/guide';
    }

    return (
        <Container fluid className="d-flex align-items-center justify-content-end">
            <Button
                className="guideButton px-5 mt-4 mx-3 fw-bold"
                onClick={handleNavigation}
            >
                Guida
            </Button>
        </Container>
    );
}

export default GuideButton;