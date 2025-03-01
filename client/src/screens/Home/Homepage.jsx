import {Button, Container} from "react-bootstrap";
import {useNavigate} from "react-router";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import {useState} from "react";
import RequestRegistration from "./RequestRegistration.jsx";

gsap.registerPlugin(useGSAP);

function Homepage() {
    const navigate = useNavigate();
    const [contactUs, setContactUs] = useState(false);


    useGSAP(() => {
        gsap.from(".form-buttons-container", {
                duration: 0.4,
                opacity: 0,
                y: 20,
                ease: "power2.inOut",
            }
        )
    }, [contactUs])

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
                    ? (<RequestRegistration navigate={navigate} setContactUs={setContactUs}/>)
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