import { Routes, Route , Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx"
import Chat from "./pages/Chat.jsx";
import Login from "./pages/Login.jsx";
import "bootstrap/dist/css/bootstrap.min.css"
import {Container} from "react-bootstrap"
import NavBar from "./components/NavBar.jsx";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";

function App() {
  const {user} = useContext(AuthContext)
  return (
    <>
    <NavBar></NavBar>
    <Container className="text-secondary ">
    <Routes>
      <Route path="/register" element={user? <Chat /> : <Register></Register> } />
      <Route path="/" element={user? <Chat /> : <Login></Login> } />
      <Route path="/login" element={user? <Chat /> : <Login></Login>} />
      <Route path="/*" element={<Navigate to ="/"/>} />

    </Routes>
    </Container>
    </>
  );
}

export default App;
