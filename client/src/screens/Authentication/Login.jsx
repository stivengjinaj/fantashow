import {Button, Container, Form, Image, InputGroup, Spinner} from "react-bootstrap";
import person from "../../assets/icons/person.svg";
import lock from "../../assets/icons/lock.svg";
import {useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {updateLastLogin} from "../../API.js";
import {loginWithEmail} from "../../utils/auth.js";


function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    function tweenError(){
        gsap.to(".login-form-width", {
                x: 0
        });
    }

    useGSAP(() => {
        if(error){
            gsap.from(".login-form-width", {
                x: -10,
                duration: 0.1,
                repeat: 3,
                yoyo: true,
                ease: "power2.inOut",
                onComplete: tweenError,
            });
        }
    }, [error]);

    useGSAP(() => {
        gsap.from([".login-form-width", ".outlined-orange-button", ".forgot-password-container"], {
            y: 20,
            duration: 0.5,
            opacity: 0,
            ease: "power2.inOut",
        });
        gsap.from(".main-title-margin", {
            duration: 0.5,
            opacity: 0,
            x: -20,
        });
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(false);
        setLoading(true);
        if(email.trim() === "" || password.trim() === ""){
            setErrorMessage("Inserisci email e password");
            setError(true);
            setLoading(false);
        }
        else{
            const response = await loginWithEmail(email, password, rememberMe);
            if(response.success){
                const idToken = await response.user.getIdToken();
                await updateLastLogin(response.user.uid, idToken);
            }
            else {
                setError(true);
                setErrorMessage(response.message);
                setLoading(false);
            }
        }
    }

    const handleEmailChange = (e) => {
        setError(false);
        setLoading(false);
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setError(false);
        setLoading(false);
        setPassword(e.target.value);
    }

    return(
        <Container fluid className="animated-bg">
            <Container fluid className="d-flex align-items-center justify-content-end">
                <Button className="guideButton px-5 mt-4 mx-3 fw-bold">
                    Guida
                </Button>
            </Container>

            {/*Main Title*/}
            <Container fluid className="d-flex justify-content-center mt-5">
                <h2 className="mt-5 main-title-margin text-light text-center">
                    Login
                </h2>
            </Container>

            <Container fluid className="d-flex flex-column align-items-center justify-content-center mt-5">
                {error && <p className="text-danger fw-bold">{errorMessage}</p>}
                <Form className={"login-form-width"} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <InputGroup className="mb-3">
                            <InputGroup.Text className="login-input-icon">
                                <Image src={person} width={25} height={25} alt="Person icon" />
                            </InputGroup.Text>
                            <Form.Control type="email" placeholder="Email" className="login-input" onChange={handleEmailChange}/>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="formBasicPassword">
                        <InputGroup className="mt-5">
                            <InputGroup.Text className="login-input-icon">
                                <Image src={lock} width={20} height={20} alt="Lock icon" />
                            </InputGroup.Text>
                            <Form.Control type="password" placeholder="Password" className="login-input" onChange={handlePasswordChange}/>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mt-3 mx-3">
                        <Form.Check type="checkbox" label="Ricordami" className={"text-light"} onChange={() => setRememberMe(!rememberMe)}/>
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-center">
                        <Button className="mt-5 outlined-orange-button border-2 rounded-3" variant="primary" type="submit">
                            {loading ? <Spinner animation="border" variant="warning" /> : "Accedi"}
                        </Button>
                    </Form.Group>
                </Form>
                <Container fluid className="d-flex justify-content-center mt-5 forgot-password-container">
                    <p className="text-light fw-bold"><a href={"/reset"} className="text-light">Password dimenticata?</a></p>
                </Container>
            </Container>
        </Container>
    )
}

export default Login;