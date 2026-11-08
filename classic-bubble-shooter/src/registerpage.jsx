 
import React, { useState } from 'react';
import './css_files/registerpage.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmpassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/signup/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);

                setFirstname("");
                setLastname("");
                setEmail("");
                setPassword("");
                setConfirmpassword("");
            } else {
                alert(data.message || "Registration failed!");
            }

        } catch (error) {
            console.error("Registration Error:", error);
            alert("Something went wrong!");
        }
    };

    return (
        <div className="parentregister">
            <div className="register-decoration">
                <div className="register-glow glow-one"></div>
                <div className="register-glow glow-two"></div>

                <div className="register-brand">
                    <span className="brand-icon">🫧</span>
                    <span>BUBBLE BLAST</span>
                    <span className="brand-highlight">ADVENTURE</span>
                </div>

                <div className="register-welcome">
                    <span className="welcome-tag">YOUR ADVENTURE STARTS HERE</span>
                    <h1>
                        Ready to<br />
                        <span>Pop Some Fun?</span>
                    </h1>
                    <p>
                        Join the adventure, challenge yourself,
                        and blast your way through 50 exciting levels!
                    </p>

                    <div className="bubble-art">
                        <span className="bubble bubble-pink"></span>
                        <span className="bubble bubble-blue"></span>
                        <span className="bubble bubble-yellow"></span>
                        <span className="bubble bubble-purple"></span>
                        <span className="bubble bubble-green"></span>
                        <span className="bubble bubble-orange"></span>
                    </div>

                    <div className="register-features">
                        <div>🎯 <span>50 exciting levels</span></div>
                        <div>🏆 <span>Earn stars and rewards</span></div>
                        <div>🚀 <span>Beat your best score</span></div>
                    </div>
                </div>
            </div>

            <div className="registerPage">
                <div className="register-card">
                    <div className="register-card-heading">
                        <span className="register-small-tag">CREATE YOUR ACCOUNT</span>
                        <h2>Let's Get Started!</h2>
                        <p>Sign up and start your bubble-popping journey.</p>
                    </div>

                    <form onSubmit={handleRegister}>
                        <div className="register-name-row">
                            <div className="register-field">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter first name"
                                    required
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                />
                            </div>

                            <div className="register-field">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter last name"
                                    required
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="register-field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="register-field">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="register-field">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Re-enter your password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmpassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="register-submit">
                            Create Account <span>→</span>
                        </button>
                    </form>

                    <div className="register-footer">
                        <span>🫧</span> Let the bubble adventure begin!
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
