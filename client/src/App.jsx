import 'bootstrap/dist/css/bootstrap.min.css';
import "./style/fonts.css";
import {Navigate, Route, Routes} from "react-router";
import Homepage from "./screens/Home/Homepage.jsx";
import Login from "./screens/Authentication/Login.jsx";
import ReferralLink from "./screens/Referral/ReferralLink.jsx";
import NotFound from "./screens/misc/NotFound.jsx";
import Support from "./screens/Support/Support.jsx";
import {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "./utils/firebase.mjs";
import Profile from "./screens/Profile/Profile.jsx";
import Register from "./screens/Registration/Register.jsx";
import PaymentSuccess from "./screens/Checkout/PaymentSuccess.jsx";
import {logout} from "./utils/auth.js";
import ResetPassword from "./screens/Authentication/ResetPassword.jsx";
import UserDashboard from "./screens/UserDashboard/UserDashboard.jsx";
import {Container, Spinner} from "react-bootstrap";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await currentUser.reload();
                if (currentUser.emailVerified) {
                    setUser(currentUser);
                } else {
                    await logout();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    if (loading) {
        return (
            <Container fluid className="p-0">
                <Container fluid className="min-vh-100 d-flex flex-column justify-content-center align-items-center dashboard-bg">
                    <Spinner variant="light" animation="border" />
                </Container>
            </Container>
        );
    }

    return (
        <Routes>
            <Route index path="/:contact?" element={user ? <UserDashboard/> : <Homepage/>}/>
            <Route path="/login" element={user ? <Navigate to="/dashboard"/> : <Login user={user}/>}/>
            <Route path="/reset" element={user ? <Navigate to="/dashboard"/> : <ResetPassword/>}/>
            <Route path="/referral/:referralCode" element={user ? <Navigate to="/dashboard"/> : <ReferralLink/>}/>
            <Route path="/support" element={<Support/>}/>
            <Route path="/profile" element={user ? <Profile/> : <Navigate to="/login"/>}/>
            <Route path="/register/:referralCode" element={user ? <Navigate to="/dashboard"/> : <Register/>}/>
            <Route path="/dashboard" element={user ? <UserDashboard user={user} /> : <Navigate to="/login"/>}/>
            <Route path="/checkout/success/" element={<PaymentSuccess/>}/>
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    );
}

export default App
