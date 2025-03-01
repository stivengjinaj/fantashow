import {Button, Container, Form, Image} from "react-bootstrap";
import {useNavigate} from "react-router";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import {useState} from "react";
import sendIcon from "../assets/icons/sendIcon.svg";
import back from "../assets/icons/back.svg";

gsap.registerPlugin(useGSAP);

function Homepage() {
    const navigate = useNavigate();
    const [contactUs, setContactUs] = useState(false);
    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [telegram, setTelegram] = useState("");
    const [isTelegramValid, setIsTelegramValid] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    useGSAP(() => {
        gsap.from(".form-buttons-container", {
                duration: 0.4,
                opacity: 0,
                y: 20,
                ease: "power2.inOut",
            }
        )
    }, [contactUs])

    useGSAP(() => {
        if (submitted && !isFormValid()) {
            const invalidControls = [];

            if (!isEmailValid && email.length > 0) {
                invalidControls.push(".emailControl");
            }

            if (!isTelegramValid && telegram.length > 0) {
                invalidControls.push(".telegramControl");
            }

            if (invalidControls.length > 0) {
                gsap.to(invalidControls, {
                    x: -10,
                    duration: 0.1,
                    repeat: 3,
                    yoyo: true,
                    ease: "power2.inOut",
                    onComplete: () => gsap.to(invalidControls, { x: 0 }),
                });
            }
        }
    }, [isEmailValid, isTelegramValid, submitted, email, telegram]);

    const isFormValid = () => {
        // If email is provided and valid, form is valid regardless of telegram
        if (email.length > 0 && isEmailValid) {
            return true;
        }
        // If email is empty or invalid, telegram must be valid and present
        return telegram.length >= 4 && isTelegramValid;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);

        if(email.length === 0 && telegram.length === 0){
            setContactUs(false);
        } else if (isFormValid()) {
            navigate("/login");
        }
    }

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        if (value.length > 0) {
            setIsEmailValid(value.includes("@") && value.includes(".") && value.length >= 4);
        } else {
            setIsEmailValid(true);
        }

        submitted && setSubmitted(false);
    }

    const handleTelegramChange = (e) => {
        const value = e.target.value;
        setTelegram(value);
        setIsTelegramValid(value.length >= 4 || value.length === 0);
        submitted && setSubmitted(false);
    }
    const shouldShowEmailError = !isEmailValid && email.length > 0 && submitted;

    // Show error for telegram if it has content and is invalid when:
    // 1. Email is empty
    // 2. Email is invalid
    const shouldShowTelegramError = telegram.length > 0 && !isTelegramValid && submitted &&
        (email.length === 0 || !isEmailValid);

    return (
        <Container fluid className="animated-bg">
            {/*Guide Button*/}
            <Container fluid className="d-flex justify-content-end">
                <Button className="guideButton px-5 mt-4 mx-3 fw-bold">
                    Guida
                </Button>
            </Container>

            {/*Main Title*/}
            <Container fluid className="d-flex justify-content-center mt-5">
                <h1 className="mt-5 main-title-margin text-light text-center">
                    Non sei ancora iscritto?
                </h1>
            </Container>

            {/*Buttons or Text input*/}
            <Container fluid className="d-flex flex-column align-items-center justify-content-center form-buttons-container">
                {/*If contactUs is clicked*/}
                {contactUs
                    ? (
                        <Form className="mt-5 d-flex flex-column align-items-center justify-content-center">
                            <Form.Group className="mb-3" controlId="formEmail">
                                <Form.Control
                                    onChange={handleEmailChange}
                                    className="outlined-orange-input px-4 emailControl"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                />
                                {shouldShowEmailError && (
                                    <Form.Text className="text-danger mx-3 fw-bold">
                                        Email non valida.
                                    </Form.Text>
                                )}
                            </Form.Group>
                            <p className="text-light text-center mt-4">Oppure</p>
                            <Form.Group className="mb-3 mt-4" controlId="formTelegram">
                                <Form.Control
                                    onChange={handleTelegramChange}
                                    className="outlined-orange-input px-4 telegramControl"
                                    type="text"
                                    placeholder="Telegram"
                                    value={telegram}
                                />
                                {shouldShowTelegramError && (
                                    <Form.Text className="text-danger mx-3 fw-bold">
                                        Telegram non valido.
                                    </Form.Text>
                                )}
                            </Form.Group>
                            <Button type={"submit"} className="mt-5 p-3 sendIcon" onClick={handleSubmit}>
                                {
                                    (email.length > 0 || telegram.length > 0)
                                        ? (<Image src={sendIcon} width={30} height={30}/>)
                                        : (<Image src={back} width={30} height={30}/>)
                                }
                            </Button>
                        </Form>
                    )
                    : (
                        <>
                            <Button onClick={() => setContactUs(true)} className="outlined-orange-button mt-5 px-5 py-2">
                                Contattaci
                            </Button>
                            <p className="mt-4 text-light fw-bold">O</p>
                            <Button onClick={() => navigate('/login')} className="outlined-orange-button mt-4 px-5 py-2">
                                Accedi
                            </Button>
                        </>
                    )
                }
            </Container>
        </Container>
    )
}

export default Homepage