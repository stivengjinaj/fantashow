import {Badge, Button, Col, Container, Form, FormControl, Image, Modal, Row} from "react-bootstrap";
import profilePicture from "../../assets/icons/profilepicture.png";
import status from "../../assets/icons/status.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import React, {useCallback, useState} from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import whatsappIcon from "../../assets/icons/whatsapp.svg";
import emailIcon from "../../assets/icons/email.svg";
import telegramIcon from "../../assets/icons/telegram.svg";
import treasury from "../../assets/icons/treasury.svg";
import {logout} from "../../utils/auth.js";
import {CheckCircleFill, Pencil, XCircleFill, ChevronDown} from "react-bootstrap-icons";
import {mapStatus} from "../../utils/helper.js";
import QrCodeDownloadButton from "../misc/QrCodeDownloadButton.jsx";

function UserDashboardMobile({ userData, userStatistics, pointStatistics, team, editTeam, setEditTeam, handleTeamChange, handleTeamSubmit }) {
    const [showPremiModal, setShowPremiModal] = useState(false);
    const [showFullRankingModal, setShowFullRankingModal] = useState(false);

    const handlePremiModalOpen = () => setShowPremiModal(true);
    const handlePremiModalClose = () => setShowPremiModal(false);
    const handleFullRankingModalOpen = () => setShowFullRankingModal(true);
    const handleFullRankingModalClose = () => setShowFullRankingModal(false);

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

    // Find current user's position in the ranking
    const getCurrentUserRank = () => {
        if (!pointStatistics || !userData) return null;
        const userIndex = pointStatistics.findIndex(user => user.username === userData.name);
        return userIndex !== -1 ? userIndex + 1 : null;
    };

    const getCurrentUserData = () => {
        if (!pointStatistics || !userData) return null;
        return pointStatistics.find(user => user.username === userData.name);
    };

    const getTopThreePlusUser = () => {
        if (!pointStatistics) return [];

        const topThree = pointStatistics.slice(0, 3);
        const currentUserRank = getCurrentUserRank();
        const currentUserData = getCurrentUserData();

        if (!currentUserRank || currentUserRank <= 3) {
            return topThree;
        }

        return [...topThree, { ...currentUserData, rank: currentUserRank }];
    };

    return (
        <Container fluid className="dashboard-bg pt-2 px-3 d-flex flex-column min-vh-100">
            <Row className="mb-3" style={{ height: "50vh" }}>
                {/* Profile section */}
                <Col xs={3} className="d-flex flex-column dashboard-container-background rounded-4 py-3 justify-content-between align-items-center rounded-3">
                    <Image src={profilePicture} alt="profile picture" width={50} height={50} roundedCircle className="mb-auto" />
                    <div className="d-flex flex-column justify-content-center align-items-center">
                        <Image src={status} width={40} height={40} roundedCircle/>
                        <small className="text-light text- text-center fw-bold">{mapStatus(userData.status)}</small>
                    </div>
                    <Image src={logoutIcon} alt="edit" width={30} height={30} onClick={logout} className="mt-auto image-button" />
                </Col>
                {/* User information section */}
                <Col xs={9} className="d-flex flex-column p-0 ps-2 align-items-center justify-content-between">
                    <Row className="w-100 mb-2" style={{ height: "100%" }}>
                        <Col xs={6} className="d-flex flex-column justify-content-evenly">
                            <h4 className="text-center fw-bold mb-2" style={{color: "#ed8101"}}>Fantashow</h4>
                            <h3 className="text-light text-center fw-bold mb-1">{userData.name}</h3>
                            {
                                editTeam
                                    ? (
                                        <Form onSubmit={handleTeamSubmit} className="d-flex justify-content-center align-items-center flex-column w-100">
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
                                        </Form>
                                    )
                                    : (
                                        <div className="d-flex flex-row justify-content-center align-items-center px-3">
                                            <h5 className="text-light text-center fw-bold mb-1">{userData.team ? userData.team : userData.favouriteTeam}</h5>
                                            {!userData.team && <Button
                                                onClick={() => {
                                                    setEditTeam(true)
                                                }}
                                                className="transparent-button rounded-5 mb-1"
                                            >
                                                <Pencil/>
                                            </Button>}
                                        </div>

                                    )
                            }
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
                                <QrCodeDownloadButton url={`https://fantashowsc.onrender.com/referral/${userData.referralCode}`} smallScreen={true}/>
                            </div>
                        </Col>
                        {/* Points and status */}
                        <Col xs={6} className="dashboard-container-background d-flex flex-column justify-content-evenly rounded-4 px-0 py-3">
                            <div className="d-flex flex-row container-fluid justify-content-center mt-3">
                                <Image src={treasury} width={60} height={60} alt={"coin"} />
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
                                    <LineChart data={userStatistics} margin={{ top: 5, right: 15, left: -25, bottom: 5 }}>
                                        <CartesianGrid stroke="rgba(255, 255, 255, 0.2)" />
                                        <XAxis dataKey="month" tick={{ fill: "white", fontSize: 10 }} tickMargin={5} />
                                        <YAxis domain={[0, 50]} tick={{ fill: "white", fontSize: 10 }} tickMargin={5} />
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
            </Row>
            {/* Updated Statistics Section */}
            <Row className="px-2 mt-2">
                <div className="dashboard-container-background rounded-4 py-3 mt-3 w-100">
                    <div className="d-flex justify-content-between align-items-center px-3 mb-3">
                        <h3 className="text-light fw-bold m-0">Classifica</h3>
                        <Button
                            className="bg-transparent border-0 p-0"
                            onClick={handleFullRankingModalOpen}
                        >
                            <ChevronDown style={{color: "white", scale: "1.5"}} />
                        </Button>
                    </div>

                    {pointStatistics ? (
                        <div className="px-3 overflow-y-scroll overflow-container" style={{maxHeight: "250px"}}>
                            {getTopThreePlusUser().map((user, index) => {
                                const actualRank = user.rank || index + 1;
                                const isCurrentUser = user.username === userData.name && actualRank > 3;

                                return (
                                    <div key={`${user.username}-${actualRank}`} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                        <div className="d-flex align-items-center">
                                            <Badge
                                                bg={actualRank <= 3 ? getRankColor(actualRank - 1) : 'danger'}
                                                className="py-2 px-3 me-3"
                                                style={{width: '35px', fontSize: '0.8rem'}}
                                            >
                                                {actualRank}
                                            </Badge>
                                            <span className={`text-light ${isCurrentUser ? 'fw-bold' : ''}`} style={{fontSize: '0.9rem'}}>
                                                {user.username}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div key={`${userData.username}`} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                <div className="d-flex align-items-center">
                                    <Badge
                                        bg='light'
                                        className="py-2 px-3 me-3"
                                        style={{width: '40px'}}
                                    >
                                        ...
                                    </Badge>
                                    <span className={`text-light fw-bold`}>{userData.username}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center px-3">
                            <h4 className="text-light">Classifica non ancora disponibile</h4>
                        </div>
                    )}
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

            {/* Full Ranking Modal */}
            <Modal
                show={showFullRankingModal}
                onHide={handleFullRankingModalClose}
                centered
                size="lg"
                className="text-light"
            >
                <Modal.Header closeButton className="dashboard-container-background border-0">
                    <Modal.Title className="text-light fw-bold">Classifica Completa</Modal.Title>
                </Modal.Header>
                <Modal.Body className="dashboard-container-background">
                    <div className="table-responsive text-center" style={{maxHeight: "400px", overflowY: "auto"}}>
                        <table className="table table-borderless classification-table">
                            <thead className="sticky-top" style={{backgroundColor: "inherit"}}>
                            <tr className="border-bottom">
                                <th scope="col" style={{fontSize: '0.9rem'}}>Pos.</th>
                                <th scope="col" style={{fontSize: '0.9rem'}}>Utente</th>
                                <th scope="col" style={{fontSize: '0.9rem'}}>Punti</th>
                                <th scope="col" style={{fontSize: '0.9rem'}}>Squadra</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pointStatistics && pointStatistics.map((user, index) => (
                                <tr
                                    key={index}
                                    className={`border-bottom ${user.username === userData.name ? 'bg-primary bg-opacity-25' : ''}`}
                                >
                                    <td>
                                        <Badge
                                            bg={getRankColor(index)}
                                            className="py-1 px-2"
                                            style={{width: '35px', fontSize: '0.75rem'}}
                                        >
                                            {index + 1}
                                        </Badge>
                                    </td>
                                    <td className={user.username === userData.name ? 'fw-bold' : ''} style={{fontSize: '0.85rem'}}>
                                        {user.username}
                                    </td>
                                    <td style={{fontSize: '0.85rem'}}>{user.points}</td>
                                    <td style={{fontSize: '0.85rem'}}>{user.team || user.favouriteTeam}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer className="dashboard-container-background border-0 d-flex justify-content-end">
                    <Button
                        variant="outline-light"
                        className="rounded-5"
                        onClick={handleFullRankingModalClose}
                    >
                        Chiudi
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default UserDashboardMobile;