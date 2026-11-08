import { NavLink } from "react-router-dom";

export default function NavBar() {
    return (
        <div>
            <ul className="r">
                <li>
                    <NavLink to="/">Home</NavLink>
                </li>
                <li>
                    <NavLink to="/map">Map</NavLink>
                </li>
                <li>
                    <NavLink to="/trees">Trees</NavLink>
                </li>
            </ul>
        </div>
    );
}