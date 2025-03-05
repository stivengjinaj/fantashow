import {Button, Container, Image} from "react-bootstrap";
import {useNavigate, useParams} from "react-router";
import ReferralError from "./ReferralError.jsx";
import navigateBack from "../../assets/icons/navigate_back.svg";

function ReferralLink() {
    const params = useParams();
    const navigate = useNavigate();
    return (
        params.referral === "ffff"
            ? (
                <Container fluid className="animated-bg">
                    {/*Guide and back button*/}
                    <Container fluid className="d-flex justify-content-between">
                        <Button className="top-back-button" onClick={() => navigate("/")}>
                            <Image src={navigateBack} width={35} height={35}/>
                        </Button>
                        <Button className="guideButton px-5 mt-4 mx-3 fw-bold">
                            Guida
                        </Button>
                    </Container>

                    {/*Main Title*/}
                    <Container fluid className="d-flex justify-content-center mt-5 pt-5">
                        <h2 className="mt-5 main-title-margin text-light text-center pt-5">
                            Stefano ti ha invitato a partecipare a Fantashow
                        </h2>
                    </Container>

                    {/*Registration Button*/}
                    <Container fluid className="d-flex justify-content-center mt-5">
                        <Button className="outlined-orange-button mt-5 px-5 py-2">
                            Registrati
                        </Button>
                    </Container>
                </Container>
            )
            : (<ReferralError/>)

    );
}

export default ReferralLink;