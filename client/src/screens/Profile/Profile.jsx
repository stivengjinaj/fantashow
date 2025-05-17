import {Container, Row, Col, Form, Button, Card, Alert, Spinner} from "react-bootstrap";
import {useState, useEffect} from "react";
import profilepicture from "../../assets/icons/profilepicture.png";
import {editUserData, getUserData} from "../../API.js";
import {useNavigate} from "react-router-dom";

function Profile({ user }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertVariant, setAlertVariant] = useState("success");
    const [formData, setFormData] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    const data = await getUserData(user.uid, idToken);
                    if (data?.message?.paid) {
                        setUserData(data.message);
                        setFormData(data.message);
                    }
                } catch {
                    navigate("/dashboard");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Simulate API call with a timeout
            const idToken = await user.getIdToken();
            await editUserData(user.uid, idToken, formData);

            // Update user data with form data
            setUserData({...formData});

            // Show success message
            setAlertVariant("success");
            setAlertMessage("Profilo aggiornato con successo!");
            setIsEditing(false);

            // Hide the alert after 3 seconds
            setTimeout(() => {
                setAlertMessage(null);
            }, 3000);
        } catch {
            // Show error message
            setAlertVariant("danger");
            setAlertMessage("Errore durante l'aggiornamento del profilo. Riprova più tardi.");

            // Hide the alert after 3 seconds
            setTimeout(() => {
                setAlertMessage(null);
            }, 3000);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setFormData({...userData});
        setIsEditing(false);
    };

    if (loading || !user) {
        return (
            <Container fluid className="p-0">
                <Container fluid className="min-vh-100 d-flex flex-column justify-content-center align-items-center dashboard-bg">
                    <Spinner variant="light" animation="border" />
                </Container>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            {alertMessage && (
                <Alert variant={alertVariant} className="mb-4">
                    {alertMessage}
                </Alert>
            )}

            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <div className="text-center mb-4">
                                <img
                                    src={profilepicture}
                                    alt="Profile"
                                    className="rounded-circle mb-3"
                                    width={120}
                                    height={120}
                                />
                                <h3>{userData.name} {userData.surname}</h3>
                                <p className="text-muted">@{userData.username}</p>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label column={2}>Nome</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label column={2}>Cognome</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="surname"
                                                value={formData.surname}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label column={2}>Username</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label column={2}>Data di nascita</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="birthYear"
                                                value={formData.birthYear}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label column={2}>Squadra del cuore</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="favouriteTeam"
                                        value={formData.favouriteTeam}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label column={2}>Telefono</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label column={2}>Telegram</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="telegram"
                                                value={formData.telegram}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <hr />

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold" column={2}>Punti</Form.Label>
                                            <p className="form-control bg-light">{userData.points}</p>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold" column={2}>Coin</Form.Label>
                                            <p className="form-control bg-light">{userData.coins}</p>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-center gap-2 mt-4">
                                    {isEditing ? (
                                        <>
                                            <Button variant="secondary" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button variant="success" type="submit">
                                                Salva
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="primary" onClick={() => setIsEditing(true)}>
                                                Modifica Profilo
                                            </Button>
                                            <Button variant="danger" onClick={() => navigate("/dashboard")}>
                                                Torna alla Dashboard
                                            </Button>
                                        </>

                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Profile;