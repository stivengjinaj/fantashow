import 'bootstrap/dist/css/bootstrap.min.css';
import "./style/fonts.css";
import {Route, Routes} from "react-router";
import Homepage from "./screens/Home/Homepage.jsx";
import Login from "./screens/Authentication/Login.jsx";
import ReferralLink from "./screens/Referral/ReferralLink.jsx";
import NotFound from "./screens/NotFound.jsx";
import Support from "./screens/Support/Support.jsx";
import {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "./utils/firebase.mjs";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

  return (
      <Routes>
          <Route index path="/:contact?" element={<Homepage/>}/>
          <Route path="/login" element={<Login user={user}/>}/>
          <Route path="/referral/:referral" element={<ReferralLink/>}/>
          <Route path="/support" element={<Support/>}/>
          <Route path="*" element={<NotFound/>}/>
      </Routes>
  )
}

export default App
