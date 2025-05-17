import React, {useCallback, useState} from 'react';
import {Container, Row, Col, Button, Image, Form, FormControl, Badge, Modal} from 'react-bootstrap';
import profilePicture from '../../assets/icons/profilepicture.png';
import logoutIcon from '../../assets/icons/logout.svg';
import whatsappIcon from '../../assets/icons/whatsapp.svg';
import emailIcon from '../../assets/icons/email.svg';
import telegramIcon from '../../assets/icons/telegram.svg';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {logout} from "../../utils/auth.js";
import {CheckCircleFill, Pencil, XCircleFill} from "react-bootstrap-icons";
import {mapStatus} from "../../utils/helper.js";


const UserDashboardDesktop = ({ userData, userStatistics, pointStatistics, team, editTeam, setEditTeam, handleTeamChange, handleTeamSubmit }) => {
    const [showPremiModal, setShowPremiModal] = useState(false);

    const handlePremiModalOpen = () => setShowPremiModal(true);
    const handlePremiModalClose = () => setShowPremiModal(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://fantashow.onrender.com/referral/${userData.referralCode}`);
    };

    const getRankColor = useCallback((index) => {
        switch(index) {
            case 0: return 'warning';
            case 1: return 'secondary';
            case 2: return 'info';
            default: return 'danger';
        }
    }, []);

    return (
        <Container fluid className="dashboard-bg p-0 d-flex flex-column min-vh-100">
            {/* Header section with profile */}
            <Row className="mx-0 mb-3">
                <Col className="p-0">
                    <div className="dashboard-container-background py-3 px-2 px-md-4 rounded-bottom-4 d-flex flex-row flex-wrap justify-content-between align-items-center">
                        <div className="d-flex flex-column align-items-center">
                            <Image src={profilePicture} alt="profile picture" width={80} height={80} roundedCircle/>
                            <h3 className="text-light fw-bold mt-2">{userData.name}</h3>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                            <h2 className="text-light text-center fw-bold user-name">Fantashow</h2>
                            <Button onClick={handleCopy} className="glowing-border-blue rounded-5">Copia referral</Button>
                            <h5 className="text-center text-light fw-bold mt-2">{mapStatus(userData.status)}</h5>
                        </div>
                        <Image src={logoutIcon} alt="edit" width={50} height={50} className="image-button" onClick={logout}/>
                    </div>
                </Col>
            </Row>

            <Row className="mx-2 mx-md-4">
                {
                    editTeam
                        ? (
                            <Form onSubmit={handleTeamSubmit} className="d-flex justify-content-center align-items-center">
                                <Form.Group className="d-flex flex-row">
                                    <FormControl
                                        className="outlined-orange-input"
                                        placeholder="Squadra..."
                                        onChange={handleTeamChange}
                                    />
                                    <Button type="submit" className="rounded-5 transparent-button">
                                        {
                                            team === ""
                                                ? <XCircleFill style={{color: "red", scale: "1.4"}} />
                                                : <CheckCircleFill style={{color: "white", scale: "1.4"}}/>
                                        }
                                    </Button>
                                </Form.Group>
                            </Form>
                        )
                        : (
                            <div className="d-flex flex-row justify-content-center align-items-center px-3">
                                <h3 className="text-light text-center text-decoration-underline fw-bold mb-1">{userData.team ? userData.team : userData.favouriteTeam}</h3>
                                {!userData.team && <Button
                                    onClick={() => {
                                        setEditTeam(true)
                                    }}
                                    className="transparent-button rounded-5 mb-1"
                                >
                                    <Pencil style={{scale: "1.4"}}/>
                                </Button>}
                            </div>

                        )
                }
            </Row>

            {/* Invite title */}
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
                            <Button
                                style={{width: "45%"}}
                                className="dashboard-container-background border-0 rounded-5 px-3 px-lg-5 fw-bold"
                                onClick={handlePremiModalOpen}
                            >
                                Premi
                            </Button>
                            <Button style={{width: "45%"}} className="dashboard-container-background border-0 rounded-5 px-3 px-lg-5 fw-bold">
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
                            <LineChart data={userStatistics} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid stroke="rgba(255, 255, 255, 0.2)" />
                                <XAxis dataKey="month" tick={{ fill: "white" }} tickMargin={10}/>
                                <YAxis domain={[1, 50]} tick={{ fill: "white" }} tickMargin={10}/>
                                <Tooltip contentStyle={{ backgroundColor: "black", color: "white", border: "none" }}/>
                                <Line type="monotone" dataKey="value" stroke="white" strokeWidth={3} dot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Col>

                {/* Third column */}
                <Col xs={12} md={4} className="mb-4">
                    <div className="dashboard-container-background rounded-4 py-3 h-100">
                        <h3 className="text-light text-center fw-bold">Classifica</h3>
                        {/* User Classification Table */}
                        <div className="mt-4">
                            {
                                pointStatistics
                                    ? <div className="table-responsive text-center overflow-container" style={{maxHeight: "300px" }}>
                                        <table className="table table-borderless classification-table">
                                            <thead>
                                            <tr className="border-bottom">
                                                <th scope="col"></th>
                                                <th scope="col">Utente</th>
                                                <th scope="col">Punti</th>
                                                <th scope="col">Squadra</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {pointStatistics.map((user, index) => (
                                                <tr key={index} className="border-bottom">
                                                    <td>
                                                        <Badge
                                                            bg={getRankColor(index)}
                                                            className="py-2 px-3"
                                                            style={{width: '40px'}}
                                                        >
                                                            {index + 1}
                                                        </Badge>
                                                    </td>
                                                    <td>{user.username}</td>
                                                    <td>{user.points}</td>
                                                    <td>{user.team || user.favouriteTeam}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    : <div className="text-center"><h4>Classifica non ancora disponibile</h4></div>
                            }
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

            {/* Premi Modal */}
            <Modal
                show={showPremiModal}
                onHide={handlePremiModalClose}
                centered
                className="text-light"
            >
                <Modal.Header closeButton className="dashboard-container-background border-0">
                    <Modal.Title className="text-light fw-bold">Premi Disponibili</Modal.Title>
                </Modal.Header>
                <Modal.Body className="dashboard-container-background">
                    <div className="p-3">
                        <div className="text-center mb-4">
                            <h5>I tuoi punti</h5>
                            <div className="d-inline-block">
                                <h3 className="m-0 fw-bold">{userData.points || 0}</h3>
                            </div>
                        </div>

                        <div className={`mb-4 p-3 border rounded ${userData.points >= 150 ? 'border-success' : 'border-light'}`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold">Buono da 10€</h6>
                                <Badge bg={userData.points >= 150 ? 'success' : 'secondary'} className="py-2 px-3">
                                    150 punti
                                </Badge>
                            </div>
                            <div className="progress mt-2 mb-2" style={{height: "10px"}}>
                                <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{width: `${Math.min(100, (userData.points / 150) * 100)}%`}}
                                    aria-valuenow={Math.min(100, (userData.points / 150) * 100)}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>

                        <div className={`mb-4 p-3 border rounded ${userData.points >= 600 ? 'border-success' : 'border-light'}`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold">Buono da 30€</h6>
                                <Badge bg={userData.points >= 600 ? 'success' : 'secondary'} className="py-2 px-3">
                                    600 punti
                                </Badge>
                            </div>
                            <div className="progress mt-2 mb-2" style={{height: "10px"}}>
                                <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{width: `${Math.min(100, (userData.points / 600) * 100)}%`}}
                                    aria-valuenow={Math.min(100, (userData.points / 600) * 100)}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>

                        <div className={`p-3 border rounded ${userData.points >= 1200 ? 'border-success' : 'border-light'}`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold">Buono da 60€</h6>
                                <Badge bg={userData.points >= 1200 ? 'success' : 'secondary'} className="py-2 px-3">
                                    1200 punti
                                </Badge>
                            </div>
                            <div className="progress mt-2 mb-2" style={{height: "10px"}}>
                                <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{width: `${Math.min(100, (userData.points / 1200) * 100)}%`}}
                                    aria-valuenow={Math.min(100, (userData.points / 1200) * 100)}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="dashboard-container-background border-0 d-flex justify-content-end">
                    <Button
                        variant="outline-light"
                        className="rounded-5"
                        onClick={handlePremiModalClose}
                    >
                        Chiudi
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UserDashboardDesktop;