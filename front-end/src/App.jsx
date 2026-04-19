import { Routes, Route, Navigate } from "react-router-dom";
import Register        from "./pages/Register.jsx";
import Chat            from "./pages/Chat.jsx";
import Login           from "./pages/Login.jsx";
import Home            from "./pages/Home.jsx";
import ForgotPassword  from "./pages/ForgotPassword.jsx";
import PublishTrip     from "./pages/PublishTrip.jsx";
import MyReservations  from "./pages/MyReservations.jsx";
import Profile         from "./pages/Profile.jsx";
import TripDetail      from "./pages/TripDetail.jsx";
import UserSearch      from "./pages/UserSearch.jsx";
import PaymentSuccess  from "./pages/PaymentSuccess.jsx";
import Landing  from "./pages/Landing.jsx";
import Settings       from "./pages/Settings.jsx";

import Support         from "./pages/Support.jsx"; 

import NavBar          from "./components/NavBar.jsx";
import { useContext }  from "react";
import { AuthContext } from "./context/AuthContext.jsx";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#0f0a1e" }}>
      <NavBar />
      <div style={{ height: "calc(100vh - 64px)", overflowY: "auto", overflowX: "hidden" }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={user ? <Home /> : <Landing />} />
          <Route path="/login"                  element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register"               element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/forgot-password"        element={<ForgotPassword />} />
          <Route path="/trips/:id"              element={<TripDetail />} />
          <Route path="/profile/:userId"        element={<Profile />} />
          <Route path="/search-users"           element={<UserSearch />} />
          <Route path="/support"               element={<Support />} />

          {/* Protected */}
          <Route path="/profile"                element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/publish-trip"           element={user ? <PublishTrip /> : <Navigate to="/login" />} />
          <Route path="/my-reservations"        element={user ? <MyReservations /> : <Navigate to="/login" />} />
          <Route path="/payment-success/:id"    element={user ? <PaymentSuccess /> : <Navigate to="/login" />} />
          <Route path="/chat"                   element={user ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/settings"               element={user ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/*"                      element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
