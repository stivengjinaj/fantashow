import {Container} from "react-bootstrap";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

function Login(){

    useGSAP(() => {
        gsap.from(".animated2-bg", {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            stagger: 0.2
        })
    })


    return(
        <Container fluid className="animated-bg">
            <Container>
                <p>ofwfowfnwrof</p>
            </Container>
        </Container>
    )
}

export default Login;