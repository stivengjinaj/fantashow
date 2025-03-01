import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/fonts/Itim-Regular.ttf";
import {Route, Routes} from "react-router";
import Homepage from "./screens/Home/Homepage.jsx";
import Login from "./screens/Login.jsx";
import ReferralLink from "./screens/Referral/ReferralLink.jsx";

function App() {

  return (
      <Routes>
          <Route index path="/" element={<Homepage/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/referral/:referral" element={<ReferralLink/>}/>
      </Routes>
  )
}

export default App
