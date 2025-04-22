import 'bootstrap/dist/css/bootstrap.min.css';
import "./style/fonts.css";
import { Navigate, Route, Routes } from "react-router";
import { Container, Spinner } from "react-bootstrap";

import Homepage from "./screens/Home/Homepage.jsx";
import Login from "./screens/Authentication/Login.jsx";
import ReferralLink from "./screens/Referral/ReferralLink.jsx";
import NotFound from "./screens/misc/NotFound.jsx";
import Support from "./screens/Support/Support.jsx";
import Profile from "./screens/Profile/Profile.jsx";
import Register from "./screens/Registration/Register.jsx";
import PaymentSuccess from "./screens/Checkout/PaymentSuccess.jsx";
import ResetPassword from "./screens/Authentication/ResetPassword.jsx";
import UserDashboard from "./screens/UserDashboard/UserDashboard.jsx";
import PaymentError from "./screens/Checkout/PaymentError.jsx";
import ErrorBoundary from "./screens/misc/ErrorBoundary.jsx";
import {useEffect, useState} from "react";
import AdminDashboard from "./screens/Admin/AdminDashboard.jsx";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "./utils/firebase.mjs";
import {getAdminData} from "./API.js";
import {logout} from "./utils/auth.js";

function AppRoutes() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);

            try {
                if (currentUser) {
                    await currentUser.reload();

                    if (currentUser.emailVerified) {
                        setUser(currentUser);

                        try {
                            const idToken = await currentUser.getIdToken();
                            const adminData = await getAdminData(currentUser.uid, idToken);
                            setIsAdmin(adminData.message.isAdmin);
                        } catch (error) {
                            console.error("Error fetching admin status:", error);
                            setIsAdmin(false);
                        }
                    } else {
                        await logout();
                        setUser(null);
                        setIsAdmin(false);
                    }
                } else {
                    setUser(null);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error in auth state change handler:", error);
                setUser(null);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

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
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Homepage />} />
            <Route path="/:contact?" element={user ? <UserDashboard /> : <Homepage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/reset" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />
            <Route path="/referral/:referralCode" element={user ? <Navigate to="/dashboard" /> : <ReferralLink />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/register/:referralCode" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/dashboard" element={
                user
                    ? isAdmin ? <AdminDashboard user={user}/> : <UserDashboard user={user}/>
                    : <Navigate to="/login" />
            } />
            <Route path="/checkout/success/" element={<PaymentSuccess />} />
            <Route path="/checkout/error" element={<PaymentError />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AppRoutes />
        </ErrorBoundary>
    );
}

export default App;
