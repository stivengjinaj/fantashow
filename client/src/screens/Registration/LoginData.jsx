import {Button, Container, Form, Image, Spinner} from "react-bootstrap";
import next from "../../assets/icons/next.svg";
import {useState} from "react";
import {registerFirebaseUser, registerUser} from "../../API.js";
import {deleteUnregisteredUser} from "../../utils/auth.js";

function LoginData({dispatch, state, nextStep, prevStep, saveUid}) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        if (Object.keys(errors).length > 0) {
            setErrors({});
        }
        dispatch({type: "UPDATE_DATA", payload: {[e.target.name]: e.target.value}});
    }

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (validate()) {
            let newErrors = {};
            const { success, uid, error } = await registerFirebaseUser(state.email, state.password);

            if(success){
                saveUid(uid);
                const { success: apiSuccess, error: apiError } = await registerUser(state, uid);

                if (apiSuccess) {
                    handleNext();
                } else {
                    setLoading(false);
                    await deleteUnregisteredUser(uid);
                    newErrors.passwordConfirm = apiError;
                }
            } else {
                await deleteUnregisteredUser(uid);
                newErrors.passwordConfirm = error;
            }
            setErrors(newErrors);
        }
        setLoading(false);
    }


    const validate = () => {
        let newErrors = {};
        if (!state.email) {
            newErrors.email = "Il campo è obbligatorio";
        }
        if (!state.username) {
            newErrors.username = "Il campo è obbligatorio";
        }
        if (!state.password) {
            newErrors.password = "Il campo è obbligatorio";
        }
        if (!state.passwordConfirm) {
            newErrors.passwordConfirm = "Il campo è obbligatorio";
        }
        if (state.password !== state.passwordConfirm) {
            newErrors.passwordConfirm = "Le password non coincidono";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleNext = () => {
        if (validate()) {
            nextStep();
        }
    }

    return (
        <Container fluid className="d-flex flex-column align-items-center justify-content-center">
            <h2 className="text-light text-center mt-5">Dati di accesso</h2>
            <Form className="mt-5 login-form-width">
                <Form.Group className="mb-md-5 mb-4">
                    <Form.Control
                        type="email"
                        placeholder="Email*"
                        className="outlined-orange-input"
                        name="email"
                        value={state.email || ""}
                        onChange={handleChange}
                    />
                    {errors.email && <p className="mx-2 text-danger">{errors.email}</p>}
                </Form.Group>
                <Form.Group className="mb-md-5 mb-4">
                    <Form.Control
                        type="text"
                        placeholder="Username*"
                        className="outlined-orange-input"
                        name="username"
                        value={state.username || ""}
                        onChange={handleChange}
                    />
                    {errors.username && <p className="mx-2 text-danger">{errors.username}</p>}
                </Form.Group>
                <Form.Group className="mb-md-5 mb-4">
                    <Form.Control
                        type="password"
                        placeholder="Password*"
                        className="outlined-orange-input"
                        name="password"
                        value={state.password || ""}
                        onChange={handleChange}
                    />
                    {errors.password && <p className="mx-2 text-danger">{errors.password}</p>}
                </Form.Group>
                <Form.Group className="mb-md-5 mb-4">
                    <Form.Control
                        type="password"
                        placeholder="Conferma Password*"
                        className="outlined-orange-input"
                        name="passwordConfirm"
                        value={state.passwordConfirm || ""}
                        onChange={handleChange}
                    />
                    {errors.passwordConfirm && <p className="mx-2 text-danger">{errors.passwordConfirm}</p>}
                </Form.Group>
            </Form>
            <Container fluid className="d-flex justify-content-center mt-3">
                <Button onClick={prevStep} className="sendIcon p-3 mt-3 mx-5">
                    <Image src={next} width={30} height={30} style={{transform: `rotate(-180deg)`}}/>
                </Button>
                <Button onClick={register} className="guideButton p-3 mt-3 mx-3">
                    {loading ? <Spinner animation="border" variant="warning" /> : "Vai al pagamento"}
                </Button>
            </Container>
        </Container>
    );
}

export default LoginData;