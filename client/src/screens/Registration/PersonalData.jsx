import {Button, Container, Form, Image, InputGroup, Modal} from "react-bootstrap";
import {useState} from "react";
import infoIcon from "../../assets/icons/info.svg";
import next from "../../assets/icons/next.svg";

function PersonalData({ nextStep, dispatch, state }) {
    const [capInfo, setCapInfo] = useState(false);
    const [squadraInfo, setSquadraInfo] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        let newErrors = {};
        if (!state.nome.trim()) newErrors.nome = "Il campo è obbligatorio.";
        if (!state.cognome.trim()) newErrors.cognome = "Il campo è obbligatorio.";
        if (!state.annoNascita || state.annoNascita < 1900 || state.annoNascita > new Date().getFullYear()) newErrors.annoNascita = "Scrivi solo anno di nascita";
        if (!state.cap) newErrors.cap = "Il campo è obbligatorio.";
        if (!state.squadraDelCuore) newErrors.squadraDelCuore = "Il campo è obbligatorio.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleNext = () => {
        if (validate()) {
            nextStep();
        }
    };

    const handleCapInfo = () => setCapInfo(!capInfo);
    const handleSquadra = () => setSquadraInfo(!squadraInfo);

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
                <Modal.Body>Servirá ai nostro admin per la creazione dei tornei locali.</Modal.Body>
            </Modal>
            <Modal show={squadraInfo} onHide={handleSquadra}>
                <Modal.Header closeButton>
                    <Modal.Title>Perchè devi specificare la squadra del cuore?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Servirá ai nostro admin per la creazione dei tornei speciali.</Modal.Body>
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
                        placeholder="Anno di nascita*"
                        className="outlined-orange-input"
                        min={1900} max={2020}
                        name="annoNascita"
                        value={state.annoNascita || ""}
                        onChange={handleChange}
                    />
                    <p className="mx-2 text-danger">{errors.annoNascita}</p>
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
                    <Form.Control
                        type="text"
                        placeholder="Squadra del cuore*"
                        className="outlined-orange-input"
                        name="squadraDelCuore"
                        value={state.squadraDelCuore || ""}
                        onChange={handleChange}
                    />
                    <InputGroup.Text className="rounded-end-5 bg-transparent" style={{border: "2px solid #FF914D"}}>
                        <Image src={infoIcon} width={20} height={20} onClick={handleSquadra}/>
                    </InputGroup.Text>
                </InputGroup>
                <p className="mb-4 mx-2 text-danger">{errors.squadraDelCuore}</p>
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