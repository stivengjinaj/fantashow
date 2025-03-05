import {useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {Button, Form, Image} from "react-bootstrap";
import sendIcon from "../../assets/icons/sendIcon.svg";
import back from "../../assets/icons/back.svg";


function RequestRegistration(props) {
    const navigate = props.navigate;
    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [telegram, setTelegram] = useState("");
    const [isTelegramValid, setIsTelegramValid] = useState(true);
    const [submitted, setSubmitted] = useState(false);

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
                    onComplete: () => gsap.to(invalidControls, { x: 0}),
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
            if(props.contactParam === "contact"){
                props.setContactUs(false);
                navigate("/");
            }else {
                props.setContactUs(false);
            }
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
    );
}

export default RequestRegistration;