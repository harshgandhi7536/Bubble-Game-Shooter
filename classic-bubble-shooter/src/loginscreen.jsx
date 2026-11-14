

import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "./css_files/loginscreen.css";
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_URL = import.meta.env.VITE_API_URL;

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(`${API_URL}/signup/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem(
                "bubble-shooter-user",
                JSON.stringify(data.user)
            );

            navigate("/dashboard", {
                state: { user: data.user }
            });

        } else {
            alert(data.message || "Login failed");
        }

    } catch (error) {
        console.log("Login Error:", error);
        alert("Unable to connect to server!");
    }
};

    return (
        <div className="login-parent">

            {/* Decorative bubbles */}
            <div className="login-bubble bubble-one"></div>
            <div className="login-bubble bubble-two"></div>
            <div className="login-bubble bubble-three"></div>
            <div className="login-bubble bubble-four"></div>

            <div className="login-container">

                {/* Left side branding */}
                <div className="login-welcome">

                    <div className="login-logo">
                        <span className="logo-bubble pink"></span>
                        <span className="logo-bubble blue"></span>
                        <span className="logo-bubble yellow"></span>
                    </div>

                    <h1>
                        BUBBLE <span>SHOOTER</span>
                    </h1>

                    <h2>Ready to Play?</h2>

                    <p>
                        Welcome back, player! Your next bubble
                        adventure is waiting for you.
                    </p>

                    <div className="welcome-decoration">
                        <span>●</span>
                        <span>●</span>
                        <span>●</span>
                        <span>●</span>
                        <span>●</span>
                    </div>

                    <div className="welcome-tagline">
                        AIM. SHOOT. MATCH. WIN.
                    </div>

                </div>

                {/* Login form */}
                <div className="login-form-section">

                    <div className="login-card">

                        <div className="login-heading">
                            <span className="login-icon">✦</span>

                            <h2>Welcome Back!</h2>

                            <p>Sign in to continue your adventure</p>
                        </div>

                        <form onSubmit={handleLogin}>

                            <div className="login-input-group">
                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <div className="login-input-wrapper">
                                    <span className="input-icon">✉</span>

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="login-input-wrapper">
                                    <span className="input-icon">🔒</span>

                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-submit-btn"
                            >
                                Login to Game
                                <span> → </span>
                            </button>

                        </form>

                        <div className="login-divider">
                            <span></span>
                            <p>NEW TO POPVERSE?</p>
                            <span></span>
                        </div>

                        <p className="signup-text">
                            Don't have an account?
                            <Link to="/signup"> Create Account</Link>
                        </p>

                    </div>

                    <p className="login-footer">
                        © 2026 POPVERSE · LET THE FUN BEGIN!
                    </p>

                </div>

            </div>
        </div>
    );
}

export default LoginPage;
