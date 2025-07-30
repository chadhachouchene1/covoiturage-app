import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, postRequest } from "../utils/services";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: ""
  });

  // 🧠 Load user from localStorage only once
  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log("User loaded from localStorage:", JSON.parse(storedUser)); 
    }
  }, []);


  const logoutUser = useCallback(() => {
  console.log("User logged out");
  localStorage.removeItem("User"); // ✅ this is the correct key
  setUser(null);
}, []);





  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();

      setIsRegisterLoading(true);
      setRegisterError(null);

      const response = await postRequest(
        `${baseUrl}/users/registrer`,
        registerInfo
      );

      setIsRegisterLoading(false);

     
      if (response.error) {
        console.error("Registration failed:", response.message); // ✅ Console log error
        return setRegisterError(response.message);
      }

      // Save only user and token, not the full message
      localStorage.setItem("User", JSON.stringify(response.user));
      setUser(response.user);
       console.log("User registered successfully:", response.user); 
    },
    [registerInfo]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        registerInfo,
        updateRegisterInfo,
        registerUser,
        registerError,
        logoutUser,
        isRegisterLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
