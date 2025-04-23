import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { PeopleFill, PersonCheckFill, ClockFill, ExclamationCircleFill } from 'react-bootstrap-icons';

function DashboardSummary({ totalUsers, paidUsers, notPaidUsers, openTickets }) {
    return (
        <Row className="g-3 mb-4">
            <Col sm={6} md={3}>
                <Card className="text-white bg-primary h-100">
                    <Card.Body className="d-flex align-items-center">
                        <div className="me-3">
                            <PeopleFill size={28} />
                        </div>
                        <div>
                            <h6 className="mb-0">Utenti</h6>
                            <h3 className="mb-0">{totalUsers}</h3>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col sm={6} md={3}>
                <Card className="text-white bg-success h-100">
                    <Card.Body className="d-flex align-items-center">
                        <div className="me-3">
                            <PersonCheckFill size={28} />
                        </div>
                        <div>
                            <h6 className="mb-0">Pagato</h6>
                            <h3 className="mb-0">{paidUsers}</h3>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col sm={6} md={3}>
                <Card className="text-white bg-danger h-100">
                    <Card.Body className="d-flex align-items-center">
                        <div className="me-3">
                            <ClockFill size={28} />
                        </div>
                        <div>
                            <h6 className="mb-0">Non pagato</h6>
                            <h3 className="mb-0">{notPaidUsers}</h3>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col sm={6} md={3}>
                <Card className="text-white bg-warning h-100">
                    <Card.Body className="d-flex align-items-center">
                        <div className="me-3">
                            <ExclamationCircleFill size={28} />
                        </div>
                        <div>
                            <h6 className="mb-0">Ticket Aperti</h6>
                            <h3 className="mb-0">{openTickets}</h3>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default DashboardSummary;