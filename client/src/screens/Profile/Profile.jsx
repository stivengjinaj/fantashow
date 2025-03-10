import {Container, Image} from "react-bootstrap";
import Topbar from "./Topbar.jsx";
import {useEffect, useState} from "react";
import profilepicture from "../../assets/icons/profilepicture.png";


function Profile() {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <Container fluid className="px-0">
            <Topbar screenWidth={screenWidth}/>
            {
                screenWidth > 768
                    ? (
                        <Container fluid className="d-flex justify-content-center">
                            <Image
                                src={profilepicture}
                                width={150} height={150}
                                className="profile-picture"
                            />

                        </Container>
                    )
                    : (
                        <Image
                            src={profilepicture}
                            width={150} height={150}
                            className="profile-picture"
                        />
                    )
            }
        </Container>
    );
}

export default Profile;