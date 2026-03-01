import { Routes, Route, Navigate } from "react-router-dom";
import Register        from "./pages/Register.jsx";
import Chat            from "./pages/Chat.jsx";
import Login           from "./pages/Login.jsx";
import Home            from "./pages/Home.jsx";
import ForgotPassword  from "./pages/ForgotPassword.jsx";
import Landing         from "./pages/Landing.jsx";
import NavBar          from "./components/NavBar.jsx";
import { useContext }  from "react";
import { AuthContext } from "./context/AuthContext.jsx";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff" }}>

      {/* NavBar affichée sur toutes les pages */}
      <NavBar />

      <Routes>

        {/* Racine : Landing si visiteur, Home si connecté */}
        <Route path="/"                element={user ? <Home />            : <Landing />} />

        {/* Routes publiques */}
        <Route path="/register"        element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/login"           element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Routes privées */}
        <Route path="/chat"            element={user ? <Chat />  : <Navigate to="/login" />} />

        {/* Fallback */}
        <Route path="/*"               element={<Navigate to="/" />} />

      </Routes>
    </div>
  );
}

export default App;
