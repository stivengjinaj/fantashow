import { Button, Col, Container, Image, Row } from "react-bootstrap";
import profilePicture from "../../assets/icons/profilepicture.png";
import status from "../../assets/icons/status.svg";
import editIcon from "../../assets/icons/edit.svg";
import React from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import whatsappIcon from "../../assets/icons/whatsapp.svg";
import emailIcon from "../../assets/icons/email.svg";
import telegramIcon from "../../assets/icons/telegram.svg";
import coin from "../../assets/icons/coin.svg";

function UserDashboardMobile({ userData }) {
    const data = [
        { month: "Aprile", value: 4 },
        { month: "Maggio", value: 7 },
        { month: "Giugno", value: 5 },
        { month: "Luglio", value: 9 },
        { month: "Agosto", value: 6 },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(`http://localhost:5173/referral/${userData.referralCode}`);
    };

    return (
        <Container fluid className="dashboard-bg pt-2 px-3 d-flex flex-column min-vh-100">
            <Row className="mb-3" style={{ height: "50vh" }}>
                {/* Profile section */}
                <Col xs={3} className="d-flex flex-column dashboard-container-background rounded-4 py-3 justify-content-between align-items-center rounded-3">
                    <Image src={profilePicture} alt="profile picture" width={50} height={50} roundedCircle className="mb-auto" />
                    <Image src={status} width={40} height={40} roundedCircle className="my-4" />
                    <Image src={editIcon} alt="edit" width={20} height={20} className="mt-auto" />
                </Col>
                {/* User information section */}
                <Col xs={9} className="d-flex flex-column p-0 ps-2 align-items-center justify-content-between">
                    <Row className="w-100 mb-2" style={{ height: "100%" }}>
                        <Col xs={6} className="d-flex flex-column justify-content-evenly">
                            <h4 className="text-center fw-bold mb-2" style={{color: "#ed8101"}}>Fantashow</h4>
                            <h3 className="text-light text-center fw-bold mb-2">{userData.name}</h3>
                            <div className="text-center">
                                <Button
                                    onClick={handleCopy}
                                    className="glowing-border rounded-5"
                                    style={{
                                        fontSize: "0.75rem",
                                        padding: "0.2rem 0.5rem",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Copia referral
                                </Button>
                            </div>
                        </Col>
                        {/* Points and status */}
                        <Col xs={6} className="dashboard-container-background d-flex flex-column justify-content-evenly rounded-4 px-0 py-3">
                            <div className="d-flex flex-row container-fluid justify-content-center mt-3">
                                <Image src={coin} width={60} height={60} alt={"coin"} />
                            </div>
                            <div className="d-flex flex-column container-fluid justify-content-center align-items-center mt-3">
                                <h5 className="text-light fw-bold">Punti: {userData.points}</h5>
                                <h5 className="text-light fw-bold">Coin: {userData.points}</h5>
                            </div>
                        </Col>
                    </Row>
                    {/* Graph section */}
                    <Row className="w-100 px-0">
                        <Col xs={12} className="dashboard-container-background rounded-4 p-1">
                            <h3 className="text-light text-center fw-bold" style={{fontSize: "1rem"}}>Partecipanti</h3>
                            <div style={{ width: "100%", height: "120px" }}>
                                <ResponsiveContainer width="99%" height="100%" aspect={undefined}>
                                    <LineChart data={data} margin={{ top: 5, right: 15, left: -25, bottom: 5 }}>
                                        <CartesianGrid stroke="rgba(255, 255, 255, 0.2)" />
                                        <XAxis dataKey="month" tick={{ fill: "white", fontSize: 10 }} tickMargin={5} />
                                        <YAxis domain={[0, 10]} tick={{ fill: "white", fontSize: 10 }} tickMargin={5} />
                                        <Tooltip contentStyle={{ backgroundColor: "black", color: "white", border: "none" }} />
                                        <Line type="monotone" dataKey="value" stroke="white" strokeWidth={2} dot={{ r: 3, fill: "white" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
            {/* Invite title */}
            <Row className="mx-2 mt-3">
                <Col className="my-1">
                    <h3 className="text-center text-light fw-bold">Invita i tuoi amici e vinci!</h3>
                </Col>
            </Row>
            {/* Invite section */}
            <Row className="flex-grow-1 mt-3">
                <div className="px-4">
                    <h5 className="text-center text-light">Condividi il tuo codice d'invito
                        e vinci fantastici premi prima
                        ancora di partecipare!</h5>
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
                        <Button style={{width: "45%"}} className="dashboard-container-background border-0 rounded-5 px-3 px-lg-5 fw-bold">
                            Premi
                        </Button>
                        <Button style={{width: "45%"}} className="dashboard-container-background border-0 rounded-5 px-3 px-lg-5 fw-bold">
                            Guida
                        </Button>
                    </div>
                </div>
            </Row>
            {/* Statistics */}
            <Row className="px-2 mt-2">
                <div className="dashboard-container-background rounded-4 py-3 mt-3">
                    <h3 className="text-light text-center fw-bold">Statistiche</h3>
                    <div className="p-3">
                        <p className="text-light">Amici invitati: 12</p>
                        <p className="text-light">Premi vinti: 3</p>
                        <p className="text-light">Posizione in classifica: 5</p>
                        <div className="mt-4">
                            <h5 className="text-light">Prossimi obiettivi</h5>
                            <div className="progress mt-2">
                                <div className="progress-bar" role="progressbar" style={{width: "75%"}} aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Row>
            {/* Footer */}
            <Row className="mt-5 p-0">
                <div className="dashboard-container-background rounded-top-4">
                    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center px-2 container">
                        <div className="text-center text-light fw-bold">
                            <small>© 2025 Fantashow. Tutti i diritti riservati.</small>
                        </div>
                        <div className="mb-2">
                            <a href="/support" className="text-light text-decoration-none">
                                <span className="me-2 fw-bold">Supporto</span>
                                <i className="bi bi-question-circle"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </Row>
        </Container>
    );
}

export default UserDashboardMobile;