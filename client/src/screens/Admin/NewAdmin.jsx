import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { registerAdmin } from "../../API.js";

function NewAdmin({ admin }) {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const idToken = await admin.getIdToken();
            const response = await registerAdmin(
                admin.uid,
                idToken,
                formData.name,
                formData.surname,
                formData.username,
                formData.email,
                formData.password
            );

            if(response.success){
                setSuccess(`Admin registrato con successo!`);
                setFormData({
                    name: '',
                    surname: '',
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Header as="h4" className="bg-primary text-white">
                            Registra un nuovo amministratore
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Inserisci il nome"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Cognome</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        placeholder="Inserisci il cognome"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Inserisci username"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Inserisci email"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Inserisci password"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Conferma Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Conferma password"
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Registrando...' : 'Registra Admin'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default NewAdmin;