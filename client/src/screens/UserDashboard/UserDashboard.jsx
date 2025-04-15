import {useEffect, useState} from "react";
import UserDashboardDesktop from "./UserDashboardDesktop.jsx";
import UserDashboardMobile from "./UserDashboardMobile.jsx";


function UserDashboard(props) {
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
        screenWidth > 500
            ? <UserDashboardDesktop user={props.user}/>
            : <UserDashboardMobile />
    );
}

export default UserDashboard;