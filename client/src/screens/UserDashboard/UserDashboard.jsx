import { useContext, useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import UserDashboardDesktop from "./UserDashboardDesktop.jsx";
import UserDashboardMobile from "./UserDashboardMobile.jsx";
import { UserContext } from "../Contexts/UserContext.jsx";
import { logout } from "../../utils/auth.js";
import { getUserData } from "../../API.js";

function UserDashboard() {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const { user } = useContext(UserContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    const data = await getUserData(user.uid, idToken);
                    if (data?.message?.paid) {
                        setUserData(data.message);
                    } else {
                        console.warn("User has not paid. Redirecting or blocking access.");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user]);

    if (loading || !user) {
        return (
            <Container fluid className="p-0">
                <Container fluid className="min-vh-100 d-flex flex-column justify-content-center align-items-center dashboard-bg">
                    <Spinner variant="light" animation="border" />
                </Container>
            </Container>
        );
    }

    return screenWidth > 500 ? <UserDashboardDesktop userData={userData}/> : <UserDashboardMobile userData={userData}/>;
}

export default UserDashboard;
