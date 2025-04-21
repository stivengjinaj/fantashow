import React, {useState, useEffect, useContext} from 'react';
import {UserContext} from "../Contexts/UserContext.jsx";
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import {formatFirebaseTimestamp} from "../../utils/helper.js";
import {adminEditUser} from "../../API.js";

function UserEditModal({ show, edittingUser, onHide, onUserUpdated }) {
    const { user } = useContext(UserContext);
    const [error, setError] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        cap: '',
        birthYear: '',
        phone: '',
        telegram: '',
        referralCode: '',
        referredBy: '',
        team: '',
        isAdmin: false,
        points: 0,
        paid: false,
        createdAt: '',
    });

    useEffect(() => {
        if (edittingUser) {
            setFormData({
                id: edittingUser.id || '',
                name: edittingUser.name || '',
                email: edittingUser.email || '',
                cap: edittingUser.cap || '',
                birthYear: edittingUser.birthYear || '',
                phone: edittingUser.phone || '',
                referralCode: edittingUser.referralCode || '',
                referredBy: edittingUser.referredBy || '',
                team: edittingUser.team || '',
                telegram: edittingUser.telegram || '',
                isAdmin: edittingUser.isAdmin || false,
                points: edittingUser.points || 0,
                paid: edittingUser.paid || false,
                createdAt: formatFirebaseTimestamp(edittingUser.createdAt),
            });
        }
    }, [edittingUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle boolean values from select elements
        if (name === "admin") {
            setFormData(prev => ({
                ...prev,
                isAdmin: value === "true"
            }));
        } else if (name === "status") {
            setFormData(prev => ({
                ...prev,
                paid: value === "true"
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const idToken = await user.getIdToken();

            const updateData = {
                id: formData.id,
                name: formData.name,
                points: parseInt(formData.points, 10) || 0,
                isAdmin: formData.isAdmin,
                paid: formData.paid
            };

            const response = await adminEditUser(user.uid, idToken, updateData);

            if (response.success) {
                if (onUserUpdated) {
                    onUserUpdated(updateData);
                }
                onHide();
            } else {
                setError(true);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            setError(true);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit User</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {edittingUser && (
                        <>
                            {error &&
                                <Row className="my-2">
                                    <Col xs={12}>
                                    <span role="alert" className="bg-danger text-light px-3 py-2 rounded d-inline-block">
                                        Errore durante la modifica dell'utente. Riprova più tardi.
                                    </span>
                                    </Col>
                                </Row>
                            }
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={2}>ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.id}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Data registrazione</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.createdAt}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Nome</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Punti</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="points"
                                            value={formData.points}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Pagamento</Form.Label>
                                        <Form.Select
                                            name="status"
                                            value={formData.paid.toString()}
                                            onChange={handleChange}
                                        >
                                            <option value="true">Pagato</option>
                                            <option value="false">Non pagato</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>CAP</Form.Label>
                                        <Form.Control
                                            name="cap"
                                            value={formData.cap}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Anno Nascita</Form.Label>
                                        <Form.Control
                                            name="birthYear"
                                            value={formData.birthYear}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Telefono</Form.Label>
                                        <Form.Control
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Telegram</Form.Label>
                                        <Form.Control
                                            name="telegram"
                                            value={formData.telegram}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Referral</Form.Label>
                                        <Form.Control
                                            name="referral"
                                            value={formData.referralCode}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Referred By</Form.Label>
                                        <Form.Control
                                            name="referredBy"
                                            value={formData.referredBy}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Squadra</Form.Label>
                                        <Form.Control
                                            name="team"
                                            value={formData.team}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label column={3}>Admin</Form.Label>
                                        <Form.Select
                                            name="admin"
                                            value={formData.isAdmin.toString()}
                                            onChange={handleChange}
                                        >
                                            <option value="true">Si</option>
                                            <option value="false">No</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Anulla
                    </Button>
                    <Button variant="primary" type="submit">
                        Modifica
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default UserEditModal;