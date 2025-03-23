import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import profilePicture from '../../assets/icons/profilepicture.png';
import editIcon from '../../assets/icons/edit.svg';
import whatsappIcon from '../../assets/icons/whatsapp.svg';
import emailIcon from '../../assets/icons/email.svg';
import telegramIcon from '../../assets/icons/telegram.svg';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

const Dashboard = () => {
    const data = [
        { month: "Aprile", value: 4 },
        { month: "Maggio", value: 7 },
        { month: "Giugno", value: 5 },
        { month: "Luglio", value: 9 },
        { month: "Agosto", value: 6 },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText("http://localhost:5173/referral/giorganni-sfjr");
    };

    return (
        <Container fluid className="dashboard-bg p-0 d-flex flex-column min-vh-100">
            {/* Header section with profile */}
            <Row className="mx-0 mb-5">
                <Col className="p-0">
                    <div className="dashboard-container-background py-3 px-2 px-md-4 rounded-bottom-4 d-flex flex-row justify-content-between align-items-center">
                        <Image src={profilePicture} alt="profile picture" width={80} height={80} roundedCircle/>
                        <div className="d-flex flex-column align-items-center">
                            <h2 className="text-light text-center fw-bold user-name">Fantashow</h2>
                            <Button onClick={handleCopy} className="glowing-border rounded-5">Copia referral</Button>
                        </div>
                        <Image src={editIcon} alt="edit" width={40} height={40}/>
                    </div>
                </Col>
            </Row>

            {/* Title row */}
            <Row className="mx-2 mx-md-4 my-4">
                <Col className="my-4">
                    <h2 className="text-center text-light fw-bold">Invita i tuoi amici e vinci!</h2>
                </Col>
            </Row>

            {/* Main content with three columns */}
            <Row className="mx-1 mx-md-4 mx-lg-5">
                {/* First column */}
                <Col xs={12} md={4} className="mb-4">
                    <div className="px-4 px-md-2 px-lg-4">
                        <h4 className="text-center text-light">Condividi il tuo codice d'invito
                            e vinci fantastici premi prima
                            ancora di partecipare!</h4>
                        <div className="dashboard-container-background rounded-3 py-2 mt-4 d-flex flex-row justify-content-around align-items-center">
                            <Button className="bg-transparent border-0">
                                <Image src={whatsappIcon} alt="whatsapp-icon" width={40} height={40}/>
                            </Button>
                            <Button className="bg-transparent border-0">
                                <Image src={emailIcon} alt="email-icon" width={40} height={40} style={{color: "red"}}/>
                            </Button>
                            <Button className="bg-transparent border-0">
                                <Image src={telegramIcon} alt="email-icon" width={40} height={40} style={{color: "red"}}/>
                            </Button>
                        </div>
                        <div className="d-flex flex-row justify-content-between mt-3">
                            <Button className="dashboard-container-background border-0 rounded-5 px-3 px-lg-5 fw-bold">
                                Premi
                            </Button>
                            <Button className="dashboard-container-background border-0 rounded-5 px-3 px-lg-5 fw-bold">
                                Guida
                            </Button>
                        </div>
                    </div>
                </Col>

                {/* Second column */}
                <Col xs={12} md={4} className="mb-4">
                    <div className="text-center dashboard-container-background rounded-4 py-3 h-100">
                        <h3 className="text-light text-center fw-bold">Partecipanti</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid stroke="rgba(255, 255, 255, 0.2)" />
                                <XAxis dataKey="month" tick={{ fill: "white" }} tickMargin={10}/>
                                <YAxis domain={[1, 10]} tick={{ fill: "white" }} tickMargin={10}/>
                                <Tooltip contentStyle={{ backgroundColor: "black", color: "white", border: "none" }}/>
                                <Line type="monotone" dataKey="value" stroke="white" strokeWidth={3} dot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Col>

                {/* Third column */}
                <Col xs={12} md={4} className="mb-4">
                    <div className="dashboard-container-background rounded-4 py-3 h-100">
                        <h3 className="text-light text-center fw-bold">Statistiche</h3>
                        {/* Add your content for the third column here */}
                        <div className="p-3">
                            <p className="text-light">Amici invitati: 12</p>
                            <p className="text-light">Premi vinti: 3</p>
                            <p className="text-light">Posizione in classifica: 5</p>
                            {/* Add more content to fill the space */}
                            <div className="mt-4">
                                <h5 className="text-light">Prossimi obiettivi</h5>
                                <div className="progress mt-2">
                                    <div className="progress-bar" role="progressbar" style={{width: "75%"}} aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row className="mt-auto mb-0 mx-0">
                <Col className="p-0">
                    <div className="dashboard-container-background py-3 w-100 rounded-top-4">
                        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center px-4 container">
                            <div className="text-center text-light fw-bold mx-3">
                                <small>© 2025 Fantashow. Tutti i diritti riservati.</small>
                            </div>
                            <div className="mb-3 mb-md-0 mx-3">
                                <a href="/support" className="text-light text-decoration-none">
                                    <span className="me-2 fw-bold">Supporto</span>
                                    <i className="bi bi-question-circle"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;