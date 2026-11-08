import { NavLink } from "react-router-dom";

export default function NavBar() {

    return (
        <div className="navbar">
            <div className="navtab">
                <NavLink className="navtab" to="/home">Home</NavLink>
            </div>

            <div className="navtab">
                <NavLink className="navtab" to="/map">Map</NavLink>
            </div>

            <div className="navtab">
                <NavLink className="navtab" to="/trees">Trees</NavLink>
            </div>
        </div>
    );
}