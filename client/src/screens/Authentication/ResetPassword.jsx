import {Button, Container, Form, Image, InputGroup, Spinner} from "react-bootstrap";
import {useState} from "react";
import emailIcon from "../../assets/icons/email.svg";
import {resetPassword} from "../../utils/auth.js";
import {useNavigate} from "react-router";
import Guide from "../misc/Guide.jsx";
import PasswordResetSuccess from "./PasswordResetSuccess.jsx";


function ResetPassword() {
    const navigate = useNavigate();
    const [ email, setEmail ] = useState("");
    const [ emailError, setEmailError ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ success, setSuccess ] = useState(false);

    const onEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const onResetPassword = (e) => {
        e.preventDefault();
        setLoading(true);
        if(email !== "" && email.includes("@") && email.includes(".")){
            resetPassword(email.trim()).then((r) => {
                if(r.success){
                    setSuccess(true);
                }else {
                    console.log(r);
                    setEmailError("Impossibile inviare e-mail. Riprova più tardi.")
                }
                setLoading(false);
            });
        }else {
            setEmailError("L'indirizzo email non è corretto.")
            setLoading(false);
        }

    }

    return (
        success
            ? (<PasswordResetSuccess />)
            : (
                <Container fluid className="animated-bg">
                    <Guide/>

                    <Container fluid className="d-flex justify-content-center mt-5">
                        <h2 className="mt-5 main-title-margin text-light text-center">
                            Password dimenticata?
                        </h2>
                    </Container>

                    <Container fluid className="d-flex flex-column align-items-center justify-content-end mt-4">
                        <h5 className="text-light text-center">Inserisci l'indirizzo email con il quale ti sei registrato/a.</h5>
                        <Form className={"mt-3 reset-password-form-width"} onSubmit={onResetPassword}>
                            <InputGroup>
                                <InputGroup.Text className="login-input-icon rounded-start-3">
                                    <Image src={emailIcon} width={25} height={25} alt="Person icon" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    className="login-input rounded-end-3"
                                    value={email}
                                    onChange={onEmailChange}
                                />
                            </InputGroup>
                            <p className="text-danger">{emailError}</p>
                            <Form.Group className="d-flex justify-content-center">
                                <Button type="submit" className="outlined-orange-button border-2 rounded-3 mt-5">
                                    {loading ? <Spinner animation="border" variant="warning" /> : "Ripristina Password" }
                                </Button>
                            </Form.Group>
                        </Form>
                        <h5 className="text-center text-light my-3">O</h5>
                        <Button type="submit" onClick={() => navigate("/login")} className="outlined-orange-button border-2 rounded-3">Accedi</Button>
                    </Container>
                </Container>
            )
    );
}

export default ResetPassword;