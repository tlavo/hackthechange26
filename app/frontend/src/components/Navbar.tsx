import { NavLink } from "react-router-dom";

export default function NavBar() {
    return (
        <nav className="navbar" aria-label="Main navigation">
            <NavLink
                className={({ isActive }) =>
                    `navtab${isActive ? " navtab-active" : ""}`
                }
                to="/home"
            >
                Home
            </NavLink>
            <NavLink
                className={({ isActive }) =>
                    `navtab${isActive ? " navtab-active" : ""}`
                }
                to="/map"
            >
                Map
            </NavLink>
            <NavLink
                className={({ isActive }) =>
                    `navtab${isActive ? " navtab-active" : ""}`
                }
                to="/trees"
            >
                Routes
            </NavLink>
        </nav>
    );
}
