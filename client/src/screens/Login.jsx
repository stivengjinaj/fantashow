import {Button, Container, Form, Image, InputGroup} from "react-bootstrap";
import navigateBack from "../assets/icons/navigate_back.svg";
import person from "../assets/icons/person.svg";
import lock from "../assets/icons/lock.svg";
import {useNavigate} from "react-router";
import {useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

function Login(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(false);

    useGSAP(() => {
        if(error){
            gsap.from(".login-form-width", {
                x: -10,
                duration: 0.1,
                repeat: 3,
                yoyo: true,
                ease: "power2.inOut",
                onComplete: () => gsap.to(".login-form-width", {x: 0})

            })
        }
    }, [error])

    useGSAP(() => {
        gsap.from([".login-form-width", ".outlined-orange-button", ".forgot-password-container"], {
            y: 20,
            duration: 0.5,
            opacity: 0,
            ease: "power2.inOut",
        })
        gsap.from(".main-title-margin", {
            duration: 0.5,
            opacity: 0,
            x: -20,
        })
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(false);
        if(email === "" || password === ""){
            setError(true);
        }
        else{
            if(email === "stivengjinaj@hotmail.com" && password === "123"){
                navigate("/");
            }else {
                setError(true);
            }
        }
    }

    const handleEmailChange = (e) => {
        setError(false);
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setError(false);
        setPassword(e.target.value);
    }

    return(
        <Container fluid className="animated-bg">
            <Container fluid className="d-flex justify-content-between">
                <Button className="top-back-button" onClick={() => navigate("/")}>
                    <Image src={navigateBack} width={50} height={50}/>
                </Button>
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
                {error && <p className="text-danger fw-bold">Email o password errati</p>}
                <Form className={"login-form-width"}>
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
                </Form>
                <Button className="mt-5 outlined-orange-button border-2 rounded-3" variant="primary" type="submit" onClick={handleSubmit}>
                    Accedi
                </Button>
                <Container fluid className="d-flex justify-content-center mt-5 forgot-password-container">
                    <p className="text-light fw-bold"><a href={"/reset"} className="text-light">Password dimenticata?</a></p>
                </Container>
            </Container>
        </Container>
    )
}

export default Login;