import {Container} from "react-bootstrap";
import React from "react";
import SupportResponsive from "./SupportResponsive.jsx";
import "../../style/support.css"


function Support() {
    return (
        <Container fluid className="animated-bg py-4">
            <Container className="support-title d-flex justify-content-center py-4">
                <h2 className="text-light mt-1 fw-bold">Supporto</h2>
            </Container>
            <SupportResponsive/>
        </Container>
    );
}

export default Support;