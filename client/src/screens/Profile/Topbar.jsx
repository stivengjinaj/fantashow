import {Col, Container, Image, Row} from "react-bootstrap";
import notifications from "../../assets/icons/notifications.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import {logout} from "../../utils/auth.js";


function Topbar(props) {
    return (
        <Container fluid className="topbar-gradient-bg py-3 rounded-bottom-4">
            {
                props.screenWidth > 768
                    ? (
                        <Row className="align-items-center py-5">
                            <Col xs={2}></Col>

                            <Col xs={8} className="text-center">
                                <h2 className="text-light">Il mio profilo</h2>
                            </Col>

                            <Col xs={2} className="d-flex justify-content-end gap-3 px-5">
                                <Image className="mx-3" src={notifications} width={40} height={40} />
                                <Image src={logoutIcon} width={40} height={40} onClick={logout}/>
                            </Col>
                        </Row>
                    )
                    : (
                        <Row className="align-items-center py-4">
                            <Col xs={3} className="d-flex justify-content-start px-4">
                                <Image src={notifications} width={40} height={40} />
                            </Col>

                            <Col xs={6} className="text-center">
                                <h2 className="text-light lh-1">Profilo</h2>
                            </Col>

                            <Col xs={3} className="d-flex justify-content-end px-4">
                                <Image src={logoutIcon} width={40} height={40} />
                            </Col>
                        </Row>
                    )
            }
        </Container>
    );
}

export default Topbar;