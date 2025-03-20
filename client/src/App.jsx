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

function App() {
    const [user, setUser] = useState(null);

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
        });

        return () => unsubscribe();
    }, [auth]);

  return (
      <Routes>
          <Route index path="/:contact?" element={user ? <Profile/> : <Homepage/>}/>
          <Route path="/login" element={user ? <Navigate to="/profile"/> : <Login user={user}/>}/>
          <Route path="/reset" element={user ? <Navigate to="/profile"/> : <ResetPassword/>}/>
          <Route path="/referral/:referral" element={<ReferralLink/>}/>
          <Route path="/support" element={<Support/>}/>
          <Route path="/profile" element={user ? <Profile/> : <Navigate to="/login"/>}/>
          <Route path="/register/:referral" element={<Register/>}/>
          <Route path="/checkout/success/" element={<PaymentSuccess/>}/>
          <Route path="*" element={<NotFound/>}/>
      </Routes>
  )
}

export default App
