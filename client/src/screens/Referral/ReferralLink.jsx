import {Button, Container} from "react-bootstrap";
import {useParams} from "react-router";
import ReferralError from "./ReferralError.jsx";
import Guide from "../misc/Guide.jsx";

function ReferralLink() {
    const params = useParams();
    return (
        params.referral === "ffff"
            ? (
                <Container fluid className="animated-bg">

                    <Guide/>

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