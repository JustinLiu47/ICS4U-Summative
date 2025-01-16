import { useNavigate } from "react-router-dom";
import { useApplicationContext } from "../context/ApplicationContext";

function Header() {
    const navigate = useNavigate();
    const { isLoggedIn, logout, currentUser } = useApplicationContext();
    
    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="header">
            <span className="title" onClick={() => navigate("/")}>Gitflix</span>
            <span className="spacer"></span>
            {isLoggedIn ? (
                <>
                    <h1 className="welcome">Welcome, {currentUser?.firstName} </h1>
                    <button className="cart" onClick={() => navigate("/cart")}>Cart</button>
                    <button className="settings" onClick={() => navigate("/settings")}>Settings</button>
                    <button className="logout" onClick={handleLogout}>Log Out</button>
                </>
            ) : (
                <>
                    <button className="signup" onClick={() => navigate("/register")}>Sign Up</button>
                    <button className="signin" onClick={() => navigate("/login")}>Sign In</button>
                </>
            )}
        </div>
    );
}

export default Header;