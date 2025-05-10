import {Button, Container, Image, Spinner} from "react-bootstrap";
import {useNavigate, useParams} from "react-router";
import ReferralError from "./ReferralError.jsx";
import Guide from "../misc/Guide.jsx";
import {useEffect, useState} from "react";
import {checkReferral} from "../../API.js";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

function ReferralLink() {
    const params = useParams();
    const navigate = useNavigate();
    const [ loading, setLoading ] = useState(true);
    const [ wrongReferral, setWrongReferral ] = useState(false);
    const [ referrer, setReferrer ] = useState("");

    useEffect(() => {
        const checkAndRetrieveReferral = async () => {
            if(params.referralCode){
                const response = await checkReferral(params.referralCode);
                if(!response.success){
                    setWrongReferral(true);
                }else {
                    setReferrer(response.message);
                }
            }else {
                setWrongReferral(true);
            }
        }

        checkAndRetrieveReferral().then(() => setLoading(false));
    }, [params.referralCode]);

    useGSAP(() => {
        if(!wrongReferral){
            gsap.from([".main-title-margin", ".outlined-orange-button"], {
                x: -20,
                opacity: 0,
                yoyo: true,
            })
        }
    }, [referrer, wrongReferral]);

    return (
        loading
            ? (
                <Container fluid className="animated-bg">
                    <Container className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
                        <Spinner animation="border" variant="warning"/>
                    </Container>
                </Container>
            )
            : (
                wrongReferral
                    ? (<ReferralError/>)
                    : (
                        <Container fluid className="animated-bg pb-4">

                            <Guide/>

                            {/*Main Title*/}
                            <Container fluid className="d-flex flex-column align-items-center justify-content-center pt-5">
                                <Image fluid src="/favicon.png" width={400} height={250} alt="Fantashow logo"/>
                                <h2 className="mt-5 main-title-margin text-light text-center lh-base">
                                    {referrer} ti ha invitato a partecipare al prossimo fantashow, <br/> guadagna subito 20 coin.
                                </h2>
                            </Container>

                            {/*Registration Button*/}
                            <Container fluid className="d-flex justify-content-center mt-5">
                                <Button className="outlined-orange-button mt-5 px-5 py-2" onClick={() => navigate(`/register/${params.referralCode}`)}>
                                    Registrati
                                </Button>
                            </Container>
                        </Container>
                    )
        )

    );
}

export default ReferralLink;