import React, {useEffect, useState} from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import '../../style/support.css';
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {sendSupportRequest} from "../../API.js";
import SupportSuccess from "./SupportSuccess.jsx";

const SupportResponsive = () => {
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [isActive, setIsActive] = useState(false);
    const [ supportMode, setSupportMode ] = useState("email");
    const [ name, setName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ telegram, setTelegram ] = useState("");
    const [ description, setDescription ] = useState("");
    const [ error, setError ] = useState("");
    const [ supportSuccess, setSupportSuccess ] = useState(false);

    const handleToggle = () => {
        setIsActive(!isActive);

        if(supportMode === "email") {
            setSupportMode("telegram");
        }else {
            setSupportMode("email");
        }

        onContactModeChange();
    };

    useEffect(() => {
        const handleResize = () => {
            setScreenHeight(window.innerHeight);
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useGSAP(() => {
        gsap.from(".support-title", {
            duration: 0.6,
            opacity: 0,
            x: -20,
            ease: "power2.inOut",
        });
        gsap.from(".support-container", {
            duration: 0.6,
            opacity: 0,
            y: 20,
            ease: "power2.inOut",
        });
    });

    const submitSupport = async (e) => {
        e.preventDefault();
        switch (supportMode) {
            case "email":
                if (name === "" || email === "" || description === "") {
                    setError("Completare i campi obbligatori,")
                }else {
                    sendSupportRequest(supportMode, name, email, telegram, description).then((r) => {
                        if(!r.success){
                            setError("Si è verificato un errore. Riprovare più tardi.")
                        }else {
                            setSupportSuccess(true);
                        }
                    });
                }
                break;
            case "telegram":
                if (telegram === "" || description === "") {
                    setError("Completare i campi obbligatori,")
                }else {
                    sendSupportRequest(supportMode, name, email, telegram, description).then((r) => {
                        if(!r.success){
                            setError("Si è verificato un errore. Riprovare più tardi.")
                        }else {
                            setSupportSuccess(true);
                        }
                    });
                }
                break;
            default:
                setSupportMode("email");
        }
    }

    const onContactModeChange = () =>{
        setError("");
        setEmail("");
        setTelegram("");
        setName("");
        setDescription("");
    }

    return (
        supportSuccess
            ? (<SupportSuccess />)
            : (
                <Container
                    className={`support-container ${isActive ? 'active' : ''}`}
                    id="support-container"
                    style={{
                        height:
                            screenHeight <= 680
                                ? "95vh"
                                : (screenHeight >= 681 && screenHeight <= 899 && screenWidth >= 900)
                                    ? "75vh"
                                    : (screenHeight >= 900 && screenWidth >= 900)
                                        ? "60vh"
                                        : "75vh",
                    }}
                >
                    <Container className="form-container email-support py-4 px-0">
                        <Form onSubmit={submitSupport}>
                            <h3 className="text-center">Contatto email</h3>
                            <span>Risponderemo il prima possibile via email</span>
                            <Form.Control type="text" placeholder="Nome" value={name} onChange={e => {
                                setError("");
                                setName(e.target.value);
                            }} />
                            <Form.Control type="email" placeholder="E-mail" value={email} onChange={e => {
                                setError("");
                                setEmail(e.target.value);
                            }} />
                            <Form.Control as="textarea" rows={3} placeholder="Come possiamo aiutarti?" value={description} onChange={e => {
                                setError("");
                                setDescription(e.target.value);
                            }} />
                            <p className="text-danger">{error}</p>
                            <Button type="submit">Invia</Button>
                        </Form>
                    </Container>

                    <Container className="form-container telegram-support px-0 mx-0">
                        <Form onSubmit={submitSupport}>
                            <h3 className="text-center">Contatto Telegram</h3>
                            <span>Risponderemo il prima possibile via Telegram</span>
                            <Form.Control className="mt-3" type="text" placeholder="Nome utente Telegram" value={telegram} onChange={e => {
                                setError("");
                                setTelegram(e.target.value);
                            }} />
                            <Form.Control className="mt-3" type="text" placeholder="Come possiamo aiutarti?" value={description} onChange={e => {
                                setError("");
                                setDescription(e.target.value)
                            }} />
                            <p className="text-danger">{error}</p>
                            <Button type="submit">Invia</Button>
                        </Form>
                    </Container>

                    <Container className="toggle-container px-0">
                        <Container fluid className="toggle">
                            <Container className="toggle-panel toggle-left">
                                <h3 className="fw-bold">Preferisci Email?</h3>
                                <p className="fw-semibold">Descrivi come possiamo aiutarti e noi ti risponderemo appena possibile via mail</p>
                                <Button className="hidden" onClick={handleToggle}>Supporto Email</Button>
                            </Container>
                            <Container className="toggle-panel toggle-right">
                                <h3 className="fw-bold">Preferisci Telegram?</h3>
                                <p className="fw-semibold">Descrivi come possiamo aiutarti e noi ti risponderemo appena possibile via Telegram</p>
                                <Button className="hidden" onClick={handleToggle}>Supporto Telegram</Button>
                            </Container>
                        </Container>
                    </Container>
                </Container>
            )
    );
};

export default SupportResponsive;