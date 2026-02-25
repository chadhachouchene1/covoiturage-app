import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Chat from "./pages/Chat.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import NavBar from "./components/NavBar.jsx";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#0f0a1e" }}>
      <NavBar />
      <div style={{ height: "calc(100vh - 64px)", overflow: "auto" }}>
        <Routes>
          <Route path="/"                element={user ? <Home />  : <Navigate to="/login" />} />
          <Route path="/register"        element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/login"           element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/chat"            element={user ? <Chat />  : <Navigate to="/login" />} />
          <Route path="/*"               element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
