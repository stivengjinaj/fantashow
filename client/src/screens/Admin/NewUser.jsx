import {Alert, Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import {registerFirebaseUser, registerUser} from "../../API.js";
import {deleteUnregisteredUser} from "../../utils/auth.js";

function NewUser() {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        referredBy: '',
        cap: '',
        squadraDelCuore: '',
        annoNascita: '',
        cellulare: '',
        telegram: '',
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
    }

    const validate = () => {
        if (
            !formData.nome  ||
            !formData.cognome ||
            !formData.password ||
            !formData.confirmPassword ||
            !formData.email ||
            !formData.cap ||
            !formData.annoNascita ||
            !formData.username ||
            !formData.referredBy ||
            !formData.squadraDelCuore ||
            !formData.cellulare ||
            !formData.telegram
        ){
            return false;
        }
        return true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        if(!validate){
            setError("Inserisci tutti i dati");
            setIsLoading(false);
            return;
        }

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Le password non coincidono.');
            }

            const { success, uid, error } = await registerFirebaseUser(formData.email, formData.password);

            if(success){
                const { success: apiSuccess, error: apiError } = await registerUser(formData, uid);

                if(apiSuccess){
                    setSuccess(`Utente registrato con successo!`);
                }else {
                    setError(apiError);
                    await deleteUnregisteredUser(uid);
                }
            }else {
                await deleteUnregisteredUser(uid);
                setError(error);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Card>
                        <Card.Header as="h4" className="bg-primary text-white">
                            Registra un nuovo utente
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    {/* Left Column */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Nome</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nome"
                                                value={formData.nome}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Cognome</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cognome"
                                                value={formData.cognome}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Username</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Conferma Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* Right Column */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Riferito da</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="referredBy"
                                                value={formData.referredBy}
                                                onChange={handleChange}
                                                placeholder="Codice referral"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">CAP</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cap"
                                                value={formData.cap}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Squadra del cuore</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="squadraDelCuore"
                                                value={formData.squadraDelCuore}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Anno di nascita</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="annoNascita"
                                                value={formData.annoNascita}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Cellulare</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cellulare"
                                                value={formData.cellulare}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label column="sm">Telegram</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="telegram"
                                                value={formData.telegram}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid mt-3">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Registrando...' : 'Registra utente'}
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

export default NewUser;