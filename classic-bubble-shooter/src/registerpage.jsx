import React, { useState } from 'react';
import './css_files/registerpage.css';

function RegisterPage() {

    const [email, setEmail] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmpassword] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        // 1. Check password
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {

            // 2. Send data to backend
            const response = await fetch("http://localhost:8000/signup/users", {

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

            // 3. Get backend response
            const data = await response.json();

            if (response.ok) {

                alert(data.message);

                // Clear form
                setFirstname("");
                setLastname("");
                setEmail("");
                setPassword("");
                setConfirmpassword("");

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.log(error);
            alert("Something went wrong!");

        }

    };


    return (

        <div className="parentregister">

            <div className="registerPage">

                <form onSubmit={handleRegister}>

                    <h1>Register Page</h1>

                    <label>Enter first name</label>

                    <input
                        type="text"
                        placeholder="First Name"
                        required
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />

                    <label>Enter last name</label>

                    <input
                        type="text"
                        placeholder="Last Name"
                        required
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                    />

                    <label>Enter email</label>

                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label>Enter password</label>

                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <label>Confirm password</label>

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmpassword(e.target.value)}
                    />

                    <button type="submit">Register</button>

                </form>

            </div>

        </div>

    );

}

export default RegisterPage;