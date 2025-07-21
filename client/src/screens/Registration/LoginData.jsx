import {Button, Container, Form, InputGroup, Spinner} from "react-bootstrap";
import {useState} from "react";
import {registerUser} from "../../API.js";
import {deleteUnregisteredUser, registerUserWithFirebase} from "../../utils/auth.js";
import {ArrowLeft, Eye, EyeOff} from "lucide-react";

function LoginData({dispatch, state, nextStep, prevStep, saveUid}) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleChange = (e) => {
        if (Object.keys(errors).length > 0) {
            setErrors({});
        }
        dispatch({type: "UPDATE_DATA", payload: {[e.target.name]: e.target.value}});
    }

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);
        let newErrors = {};

        try {
            if (validate()) {
                localStorage.setItem("registrationInProgress", "true");

                const { success, uid, error } = await registerUserWithFirebase(state.email, state.password);

                if (success) {
                    saveUid(uid);
                    const { success: apiSuccess, error: apiError } = await registerUser(state, uid);

                    if (apiSuccess) {
                        handleNext();
                    } else {
                        await deleteUnregisteredUser(uid);
                        newErrors.passwordConfirm = apiError;
                        localStorage.removeItem("registrationInProgress");
                    }
                } else {
                    if (uid) await deleteUnregisteredUser(uid);
                    newErrors.passwordConfirm = error;
                    localStorage.removeItem("registrationInProgress");
                }
            }
        } catch (error) {
            console.error("Registration error:", error);
            newErrors.passwordConfirm = "An unexpected error occurred. Please try again.";
            localStorage.removeItem("registrationInProgress");
        } finally {
            setErrors(newErrors);
            setLoading(false);
        }
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
                <Form.Group className="mb-md-4 mb-3">
                    <InputGroup>
                        <Form.Control
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password*"
                            className="outlined-orange-input"
                            name="password"
                            value={state.password || ""}
                            onChange={handleChange}
                        />
                        <InputGroup.Text className="orange-password-visible-icon">
                            {passwordVisible
                                ? <EyeOff color="white" onClick={() => setPasswordVisible((prevState) => !prevState)}/>
                                : <Eye color="white" onClick={() => setPasswordVisible((prevState) => !prevState)} />
                            }
                        </InputGroup.Text>
                    </InputGroup>
                    {!errors.password && <p className="mx-2 text-warning">6 caratteri minimo</p> }
                    {errors.password && <p className="mx-2 text-danger">{errors.password}</p>}
                </Form.Group>
                <Form.Group className="mb-md-5 mb-4">
                    <InputGroup>
                        <Form.Control
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Conferma Password*"
                            className="outlined-orange-input"
                            name="passwordConfirm"
                            value={state.passwordConfirm || ""}
                            onChange={handleChange}
                        />
                        <InputGroup.Text className="orange-password-visible-icon">
                            {passwordVisible
                                ? <EyeOff color="white" onClick={() => setPasswordVisible((prevState) => !prevState)}/>
                                : <Eye color="white" onClick={() => setPasswordVisible((prevState) => !prevState)} />
                            }
                        </InputGroup.Text>
                    </InputGroup>
                    {errors.passwordConfirm && <p className="mx-2 text-danger">{errors.passwordConfirm}</p>}
                </Form.Group>
            </Form>
            <Container fluid className="d-flex justify-content-center mt-3">
                <Button onClick={prevStep} className="sendIcon py-3 px-4 px-sm-3 mt-3 mx-4">
                    <ArrowLeft />
                </Button>
                <Button onClick={register} className="guideButton p-3 mt-3 mx-3">
                    {loading ? <Spinner animation="border" variant="warning" /> : "Vai al pagamento"}
                </Button>
            </Container>
        </Container>
    );
}

export default LoginData;