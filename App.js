import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../src/styles/global.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { HOMEPAGE } from "./config.js";
import Chat from "./Components/Chat/Chat";
import "./index.css";
import LogInPage from "./Components/Auth/Login";
import AdminPage from "./Components/Support/SupportPage.jsx";
import SignUp from "./Components/Auth/SignUp.jsx";
import UserProfilePage from "./Components/UserProfile/UserProfilePage.jsx";
import MainComponent from "./Components/Chat/ChatDemo/MainComp.jsx";
import ChatFlow from "./Components/Chat/ChatFlow/ChatFlow.jsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import PrivateRoute from "./Components/Common/PrivateRoute.jsx";

function App() {
  return (
    <Router basename={HOMEPAGE}>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        {/* <Route element={<PrivateRoute />}> */}
        <Route path="/chat" element={<Chat />} />
        {/* <Route path="/chat" element={<MainComponent />} /> */}
        <Route path="/support/*" element={<AdminPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/chatflow" element={<ChatFlow />} />
        {/* </Route> */}
      </Routes>
    </Router>
  );
}

export default App;
