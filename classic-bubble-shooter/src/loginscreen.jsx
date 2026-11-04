 import { useNavigate } from "react-router-dom";
import { useState } from "react";
import './css_files/loginscreen.css';  
import RegisterPage from "./registerpage.jsx";
function LoginPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
         navigate("/levels");
    };
    return (
        <div className="parent">

        <div className="loginPage">
                        <h1 >SignIn</h1>
            
            <form onSubmit={handleLogin}> 
            <label htmlFor="email">Email:</label>
            <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <label htmlFor="password">Password:</label>
            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">
                Login
            </button>
            <br />
            new user? <a href="/signup">Sign up</a>

        </form>
        </div>
        </div>
    );
}

export default LoginPage;