 import { BrowserRouter, Routes, Route } from "react-router-dom";

import RegisterPage from "./registerpage";
import GameScreen from "./gamescreen";
import LoginScreen from "./loginscreen";
import Levels_Page from "./levels_page";
import PlayerDashboard from "./playerDashboard";
 function App(){
    return (
   <BrowserRouter>
    <Routes>  
      {/* Menu Page */}
          {/* <Route path="/" element={<LoginPage />} /> */}
          <Route path ="/signup" element={<RegisterPage />}/>
          <Route path ="/" element={<LoginScreen />}/>
          <Route path ="/levels" element={<Levels_Page />}/>
          <Route path ="/gamescreen" element={<GameScreen />}/>
            {/* Player Dashboard */}
          <Route path="/dashboard" element={<PlayerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
    
export default App;
 