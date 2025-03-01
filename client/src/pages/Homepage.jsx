import {Button, Container} from "react-bootstrap";
import {useNavigate} from "react-router";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";

gsap.registerPlugin(useGSAP);

function Homepage() {
    const navigate = useNavigate();

    useGSAP(() => {
        gsap.from(".animated-bg", {
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.inOut",
            stagger: 0.2
        })
    })

    return (
        <Container fluid className="animated-bg">
            <Container fluid className="d-flex justify-content-end">
                <Button className="guideButton px-5 mt-4 mx-3 fw-bold">
                    Guida
                </Button>
            </Container>

            <Container fluid className="d-flex justify-content-center mt-5">
                <h1 className="mt-5 main-title-margin text-light text-center">
                    Non sei ancora iscritto?
                </h1>
            </Container>

            <Container fluid className="d-flex flex-column align-items-center justify-content-center">
                <Button className="outlined-orange-button mt-5 px-5 py-2">
                    Contattaci
                </Button>

                <p className="mt-4 text-light fw-bold">O</p>

                <Button onClick={() => navigate('/login')} className="outlined-orange-button mt-4 px-5 py-2">
                    Accedi
                </Button>
            </Container>
        </Container>
    )
}

export default Homepage