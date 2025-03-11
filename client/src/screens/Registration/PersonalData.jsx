import {Button, Container, Form, Image, InputGroup, Modal} from "react-bootstrap";
import {useState} from "react";
import infoIcon from "../../assets/icons/info.svg";
import next from "../../assets/icons/next.svg";

function PersonalData({ nextStep, dispatch, state }) {
    const [capInfo, setCapInfo] = useState(false);
    const [sexInfo, setSexInfo] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        let newErrors = {};
        if (!state.nome.trim()) newErrors.nome = "Il campo è obbligatorio.";
        if (!state.cognome.trim()) newErrors.cognome = "Il campo è obbligatorio.";
        if (!state.eta || state.eta < 16 || state.eta > 70) newErrors.eta = "L'età deve essere un numero compreso tra 16 e 70.";
        if (!state.cap) newErrors.cap = "Il campo è obbligatorio.";
        if (!state.sesso) newErrors.sesso = "Il campo è obbligatorio.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleNext = () => {
        if (validate()) {
            nextStep();
        }
    };

    const handleCapInfo = () => setCapInfo(!capInfo);
    const handleSexInfo = () => setSexInfo(!sexInfo);

    const handleChange = (e) => {
        if (Object.keys(errors).length > 0) {
            setErrors({});
        }
        dispatch({ type: "UPDATE_DATA", payload: { [e.target.name]: e.target.value } });
    };

    return (
        <Container fluid className="d-flex flex-column align-items-center justify-content-center">
            <Modal show={capInfo} onHide={handleCapInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>Perchè devi specificare il CAP?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
            </Modal>
            <Modal show={sexInfo} onHide={handleSexInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>Perchè devi specificare il sesso?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
            </Modal>
            <h2 className="text-light text-center mt-5">Dati Personali</h2>
            <Form className="mt-5 login-form-width">
                <Form.Group className="mb-md-5 mb-4">
                    <Form.Control
                        type="text"
                        placeholder="Nome*"
                        className="outlined-orange-input"
                        name="nome"
                        value={state.nome || ""}
                        onChange={handleChange}
                    />
                    <p className="mx-2 text-danger">{errors.nome}</p>
                </Form.Group>
                <Form.Group className="mb-md-5 mb-4">
                    <Form.Control
                        type="text"
                        placeholder="Cognome*"
                        className="outlined-orange-input"
                        name="cognome"
                        value={state.cognome || ""}
                        onChange={handleChange}
                    />
                    <p className="mx-2 text-danger">{errors.cognome}</p>
                </Form.Group>
                <Form.Group className="mb-md-5 mb-4">
                    <Form.Control
                        type="number"
                        placeholder="Età*"
                        className="outlined-orange-input"
                        min={16} max={70}
                        name="eta"
                        value={state.eta || ""}
                        onChange={handleChange}
                    />
                    <p className="mx-2 text-danger">{errors.eta}</p>
                </Form.Group>
                <InputGroup>
                    <Form.Control
                        type="number"
                        placeholder="CAP*"
                        className="outlined-orange-input"
                        name="cap"
                        value={state.cap || ""}
                        onChange={handleChange}
                    />
                    <InputGroup.Text className="rounded-end-5 bg-transparent" style={{border: "2px solid #FF914D"}}>
                        <Image src={infoIcon} width={20} height={20} onClick={() => handleCapInfo(state.cap)}/>
                    </InputGroup.Text>
                </InputGroup>
                <p className="mb-md-5 mb-4 mx-2 text-danger">{errors.cap}</p>
                <InputGroup>
                    <Form.Select
                        className="outlined-orange-select"
                        name="sesso"
                        value={state.sesso || ""}
                        onChange={handleChange}
                    >
                        <option value="">Sesso*</option>
                        <option value="M">M</option>
                        <option value="F">F</option>
                    </Form.Select>
                    <InputGroup.Text className="rounded-end-5 bg-transparent" style={{border: "2px solid #FF914D"}}>
                        <Image src={infoIcon} width={20} height={20} onClick={handleSexInfo}/>
                    </InputGroup.Text>
                </InputGroup>
                <p className="mb-4 mx-2 text-danger">{errors.sesso}</p>
            </Form>
            <Container fluid className="d-flex justify-content-center mt-3">
                <Button onClick={handleNext} className="sendIcon p-3 mt-3 mx-5">
                    <Image src={next} width={30} height={30}/>
                </Button>
            </Container>
        </Container>
    );
}

export default PersonalData;