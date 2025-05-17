import {Button, Container, Form, Image} from "react-bootstrap";
import {useState} from "react";
import next from "../../assets/icons/next.svg";
import {validatePhoneNumber} from "../../utils/helper.js";

function ContactData({dispatch, state, nextStep, prevStep}) {
    const [cellulareError, setCellulareError] = useState(false);

    const handleChange = (e) => {
        cellulareError && setCellulareError(false);
        dispatch({type: "UPDATE_DATA", payload: {[e.target.name]: e.target.value}});
    }

    const handleNext = () => {
        if(validatePhoneNumber(state.cellulare)){
            nextStep();
        }else {
            setCellulareError(true);
        }
    }

    return (
        <Container fluid className="d-flex flex-column align-items-center justify-content-center">
            <h2 className="text-light text-center mt-5">Dati Personali</h2>
            <Form className="mt-5 login-form-width">
                <Form.Group className="mb-5">
                    <Form.Control
                        type="number"
                        placeholder="Cellulare*"
                        className="outlined-orange-input"
                        name="cellulare"
                        value={state.cellulare || ""}
                        onChange={handleChange}
                    />
                    {cellulareError && <p className="mx-2 text-danger mb-5">
                        {state.cellulare.length > 0 ? `Numero di telefono non valido` : `Il campo cellulare è obbligatorio`}
                    </p>}
                </Form.Group>
            </Form>
            <Container fluid className="d-flex justify-content-center mt-3">
                <Button onClick={prevStep} className="sendIcon p-3 mt-3 mx-5">
                    <Image src={next} width={30} height={30} style={{transform: `rotate(-180deg)`}}/>
                </Button>
                <Button onClick={handleNext} className="sendIcon p-3 mt-3 mx-5">
                    <Image src={next} width={30} height={30}/>
                </Button>
            </Container>
        </Container>
    );
}

export default ContactData;