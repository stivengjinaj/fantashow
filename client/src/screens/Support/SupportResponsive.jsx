import React, {useEffect, useState} from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import '../../style/support.css';
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

const SupportResponsive = () => {
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [isActive, setIsActive] = useState(false);

    const handleToggle = () => {
        setIsActive(!isActive);
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

    return (
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
                    <Form>
                        <h3 className="text-center">Contatto email</h3>
                        <span>Risponderemo il prima possibile via email</span>
                        <Form.Control type="text" placeholder="Nome" />
                        <Form.Control type="email" placeholder="E-mail" />
                        <Form.Control as="textarea" rows={3} placeholder="Come possiamo aiutarti?" />
                        <Button>Invia</Button>
                    </Form>
                </Container>

                <Container className="form-container telegram-support px-0 mx-0">
                    <Form>
                        <h3 className="text-center">Contatto Telegram</h3>
                        <span>Risponderemo il prima possibile via Telegram</span>
                        <Form.Control className="mt-3" type="text" placeholder="Nome utente Telegram" />
                        <Form.Control className="mt-3" type="text" placeholder="Come possiamo aiutarti?" />
                        <Button>Invia</Button>
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
    );
};

export default SupportResponsive;