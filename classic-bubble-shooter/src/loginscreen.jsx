//  import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import './css_files/loginscreen.css';  
// import RegisterPage from "./registerpage.jsx";
// function LoginPage() {

//     const navigate = useNavigate();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     const handleLogin = (e) => {
//          navigate("/levels");
//     };
//     return (
//         <div className="parent">

//         <div className="loginPage">
//                         <h1 >SignIn</h1>
            
//             <form onSubmit={handleLogin}> 
//             <label htmlFor="email">Email:</label>
//             <input
//                 type="email"
//                 placeholder="Enter email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//             />
//             <br />
//             <label htmlFor="password">Password:</label>
//             <input
//                 type="password"
//                 placeholder="Enter password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//             />

//             <button type="submit">
//                 Login
//             </button>
//             <br />
//             new user? <a href="/signup">Sign up</a>

//         </form>
//         </div>
//         </div>
//     );
// }

// export default LoginPage;


// import User from "../server/model/userModel.js";
// import bcrypt from "bcrypt";

// // REGISTER USER
// export const createUser = async (req, res) => {
//     try {
//         const { firstname, lastname, email, password } = req.body;

//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return res.status(400).json({
//                 message: "Email already registered!"
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = new User({
//             firstname,
//             lastname,
//             email,
//             password: hashedPassword
//         });

//         await newUser.save();

//         res.status(201).json({
//             message: "User registered successfully!"
//         });

//     } catch (error) {
//         console.log(error);

//         res.status(500).json({
//             message: "Registration failed!"
//         });
//     }
// };


import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import './css_files/loginscreen.css';

function LoginPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Check captured form data
            console.log("Email:", email);
            console.log("Password entered:", password.length > 0);

            // Send login data to backend
            const response = await fetch("http://localhost:8000/signup/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            console.log("Backend response:", data);

            if (response.ok) {
                alert(data.message);

                // Navigate after successful login
                navigate("/levels");
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.log("Login Error:", error);
            alert("Unable to connect to server!");
        }
    };

    return (
        <div className="parent">

            <div className="loginPage">

                <h1>SignIn</h1>

                <form onSubmit={handleLogin}>

                    <label htmlFor="email">Email:</label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <br />

                    <label htmlFor="password">Password:</label>

                    <input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Login
                    </button>

                    <br />

                    New user? <Link to="/signup">Sign up</Link>

                </form>

            </div>

        </div>
    );
}

export default LoginPage;
