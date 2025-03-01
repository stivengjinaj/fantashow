import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/fonts/Itim-Regular.ttf";
import {Route, Routes} from "react-router";
import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";

function App() {

  return (
      <Routes>
          <Route index path="/" element={<Homepage/>}/>
          <Route path="/login" element={<Login/>}/>
      </Routes>
  )
}

export default App
