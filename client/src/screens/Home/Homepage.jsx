import {Button, Container, Image} from "react-bootstrap";
import {useNavigate, useParams} from "react-router";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import {useEffect, useState} from "react";
import RequestRegistration from "./RequestRegistration.jsx";
import Guide from "../misc/Guide.jsx";

gsap.registerPlugin(useGSAP);

function Homepage() {
    const navigate = useNavigate();
    const params = useParams();
    const [contactUs, setContactUs] = useState(params.contact === "contact");

    useEffect(() => {
        params.contact !== "contact" && navigate("/");
    }, []);

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
        gsap.from(".main-title-margin", {
            duration: 0.5,
            opacity: 0,
            x: -20,
        })
    })

    return (
        <Container fluid className="animated-bg p-0">
            {/*Guide Button*/}
            <Guide/>

            <Container fluid className="d-flex justify-content-center">
                <Image fluid src="/favicon.png" width={400} height={250} alt="Fantashow logo"/>
            </Container>

            {/*Main Title*/}
            <Container fluid className="d-flex justify-content-center">
                <h1 className="main-title-margin text-light text-center">
                    Non sei ancora iscritto?
                </h1>
            </Container>

            {/*Buttons or Text input*/}
            <Container fluid className="d-flex flex-column align-items-center justify-content-center form-buttons-container">
                {/*If contactUs is clicked*/}
                {contactUs
                    ? (<RequestRegistration navigate={navigate} setContactUs={setContactUs} contactParam={params.contact}/>)
                    : (
                        <>
                            <Button onClick={() => setContactUs(true)} className="outlined-orange-button mt-5 px-5 py-2">
                                Contattaci
                            </Button>
                            <p className="mt-3 text-light fw-bold">O</p>
                            <Button onClick={() => navigate('/login')} className="outlined-orange-button mt-3 mb-5 px-5 py-2">
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