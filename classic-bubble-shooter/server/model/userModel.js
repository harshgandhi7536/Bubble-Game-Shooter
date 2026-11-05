//  import mongoose from "mongoose";

//  const userSchema = new mongoose.Schema({
//         // firstName, lastName, email, password,
//         firstName: {
//             type: String,
//             required: true,
//         },
//         lastName: {
//             type: String,
            
//         },
//         email:{
//             type:String,
//             required:true,
//             unique:true,
//         },
//         password:{
//             type:String,
//             required:true,
//         }
//     });

// export default mongoose.model("Users",userSchema); 

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    firstname: {
        type: String,
        required: true
    },

    lastname: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }

});

const User = mongoose.model("User", userSchema);

export default User;