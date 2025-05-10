import { useContext, useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import UserDashboardDesktop from "./UserDashboardDesktop.jsx";
import UserDashboardMobile from "./UserDashboardMobile.jsx";
import { UserContext } from "../Contexts/UserContext.jsx";
import {getStatistics, getUserData, getUserSubscriptions, updateTeam} from "../../API.js";
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
    const [ editTeam, setEditTeam ] = useState(false);
    const [ team, setTeam ] = useState("");
    const [ pointStatistics, setPointStatistics ] = useState([]);

    const handleTeamChange = (e) => {
        setTeam(e.target.value);
    }

    const handleTeamSubmit = async (e) => {
        e.preventDefault();
        if (team === "") {
            setEditTeam(false);
        } else {
            try {
                const idToken = await user.getIdToken();
                const result = await updateTeam(user.uid, idToken, team);
                if(!result.success) {
                    alert("Errore durante l'aggiornamento della squadra");
                }else {
                    setUserData(prev => ({ ...prev, team }));
                }
            } catch (e) {
                alert(`Errore durante l'aggiornamento della squadra: ${e.error}`);
            }
        }
        setEditTeam(false);
    }

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const getSubscriptions = async () => {
            try {
                const idToken = await user.getIdToken();
                const data = await getUserSubscriptions(user.uid, idToken);
                setUserStatistics(data.message);
            } catch (e) {
                console.log(e.error);
            }
        }
        const getPointsStatistics = async () => {
            try {
                const idToken = await user.getIdToken();
                const data = await getStatistics(user.uid, idToken);
                setPointStatistics(data.message);
            }catch (e){
                console.log(e.error);
            }
        }

        getSubscriptions();
        getPointsStatistics();
    }, [user]);

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
            ? <UserDashboardDesktop
                userData={userData}
                userStatistics={userStatistics}
                pointStatistics={pointStatistics}
                team={team}
                editTeam={editTeam}
                setEditTeam={setEditTeam}
                handleTeamChange={handleTeamChange}
                handleTeamSubmit={handleTeamSubmit}
            />
            : <UserDashboardMobile
                userData={userData}
                userStatistics={userStatistics}
                pointStatistics={pointStatistics}
                team={team}
                editTeam={editTeam}
                setEditTeam={setEditTeam}
                handleTeamChange={handleTeamChange}
                handleTeamSubmit={handleTeamSubmit}
            />
        :  !error
            ? <DashboardPayment title={"Il tuo account non è attivo perché non hai ancora effettuato il pagamento.\n" +
                "Puoi aggiornare il metodo di pagamento per attivarlo."}/>
            : <Error />
}

export default UserDashboard;
