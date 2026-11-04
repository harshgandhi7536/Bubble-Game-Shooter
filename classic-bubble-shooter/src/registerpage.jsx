import React, { useState } from 'react';
// import { createUserWithEmailAndPassword} from "firebase/auth"; 
// import {doc, setDoc} from "firebase/firestore";
// import {auth,db} from "../firebase";
import './css_files/registerpage.css';

function RegisterPage() {
     const [email, setEmail] = useState("");
    const [firstname, setFirstname]=useState("");
    const [lastname, setLastname]=useState("");
    const [password,setPassword]=useState("******");
    const [confirmPassword,setConfirmpassword]=useState("****");
// const handleRegister= async(e)=>{
//     e.preventDefault();
//     try{
//         // 1. Create user in Firebase Authentication
//         const userCredential= await createUserWithEmailAndPassword(
//             auth, email, password
//         );
//         const user= userCredential.user;
//         // 2. store additional information in firestore
//         await setDoc(doc(db,"usersAdditionalInfor",user.uid),{
//             firstname:firstname,
//             lastname:lastname,
//             email:email,
//             phonenumber:phonenumber,
//             uid:user.uid,
//             aadharId:aadharId
//         });

//         alert("User registered successfully!");
//     } catch(err){
//         console.error("Error registering the user");
//         alert("Error registering the user: "+err.message);
//     }
// };
    return (
        <div className="parentregister">

        <div className="registerPage">
             <form >
            {/* //  onSubmit={}  */}

            <h1>Register Page</h1>
            <label htmlFor="username">Enter first name</label>
            <input type="text" 
            placeholder="First Name" required
            value={firstname} 
            onChange={(e)=>setFirstname(e.target.value)}/>

            <label htmlFor="lastname">Enter last name</label>
            <input type="text"
             placeholder="Last Name"
             value={lastname}
             onChange={(e)=>setLastname(e.target.value)}/>
            <br />

            


            <br />
           

            <label htmlFor="email">Enter email</label>
            <input type="email"  placeholder="Email" required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}/>
            <br />
            <label htmlFor="password">Enter password</label>
            <input type="password" placeholder="Password" required 
            value={password}
            onChange={(e)=>setPassword(e.target.value)}/>

            <label htmlFor="confirmPassword">Confirm password</label>
            <input type="password" placeholder="Confirm Password" required
            value={confirmPassword}
            onChange={(e)=>setConfirmpassword(e.target.value)} />

            <button>Register</button>
            </form>
        </div>
</div>
    );
};


export default RegisterPage;