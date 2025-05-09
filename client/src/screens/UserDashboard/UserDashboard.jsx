import { useContext, useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import UserDashboardDesktop from "./UserDashboardDesktop.jsx";
import UserDashboardMobile from "./UserDashboardMobile.jsx";
import { UserContext } from "../Contexts/UserContext.jsx";
import {getUserData, getUserSubscriptions} from "../../API.js";
import DashboardPayment from "./DashboardPayment.jsx";
import Error from "../misc/Error.jsx";

function UserDashboard() {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const { user } = useContext(UserContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasPaid, setHasPaid] = useState(false);
    const [error, setError] = useState(false);
    const [userStatistics, setUserStatistics] = useState({})

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const getStatistics = async () => {
            const idToken = await user.getIdToken();
            try {
                const data = await getUserSubscriptions(user.uid, idToken);
                setUserStatistics(data.message);
            } catch (e) {
                console.log(e.error);
            }
        }

        getStatistics();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    const data = await getUserData(user.uid, idToken);
                    if (data?.message?.paid) {
                        setUserData(data.message);
                        setHasPaid(true);
                    } else {
                        setHasPaid(false);
                    }
                } catch {
                    setHasPaid(false);
                    setError(true);
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

    return hasPaid
        ? screenWidth > 500
            ? <UserDashboardDesktop userData={userData} userStatistics={userStatistics}/>
            : <UserDashboardMobile userData={userData} userStatistics={userStatistics}/>
        :  !error
            ? <DashboardPayment title={"Il tuo account non è attivo perché non hai ancora effettuato il pagamento.\n" +
                "Puoi aggiornare il metodo di pagamento per attivarlo."}/>
            : <Error />
}

export default UserDashboard;
