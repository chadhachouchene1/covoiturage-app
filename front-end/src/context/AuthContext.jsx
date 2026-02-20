import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, postRequest } from "../utils/services";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ---------------- REGISTER ----------------
  const [registerInfo, setRegisterInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    birthPlace: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  // formData is passed directly from Register.jsx (includes image + all fields)
  const registerUser = useCallback(
    async (e, formData) => {
      e.preventDefault();
      setIsRegisterLoading(true);
      setRegisterError(null);

      // Build FormData to support file upload
      const data = new FormData();
      const fields = formData || registerInfo;
      Object.keys(fields).forEach((key) => {
        if (fields[key]) data.append(key, fields[key]);
      });

      try {
        const res = await fetch(`${baseUrl}/users/register`, {
          method: "POST",
          body: data, // multipart/form-data
        });
        const response = await res.json();
        setIsRegisterLoading(false);

        if (!res.ok || response.error) {
          return setRegisterError(response.message || "Erreur lors de l'inscription");
        }

        localStorage.setItem("User", JSON.stringify(response.user));
        localStorage.setItem("Token", response.token);
        setUser(response.user);
      } catch (err) {
        setIsRegisterLoading(false);
        setRegisterError("Erreur réseau. Réessayez.");
      }
    },
    [registerInfo]
  );

  // ---------------- LOGIN ----------------
  const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const updateLoginInfo = useCallback((info) => {
    setLoginInfo(info);
  }, []);

  const loginUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoginLoading(true);
      setLoginError(null);

      const response = await postRequest(`${baseUrl}/users/login`, loginInfo);
      setIsLoginLoading(false);

      if (response.error) return setLoginError(response.message);

      localStorage.setItem("User", JSON.stringify(response.user));
      localStorage.setItem("Token", response.token);
      setUser(response.user);
    },
    [loginInfo]
  );

  // ---------------- LOGOUT ----------------
  const logoutUser = useCallback(() => {
    localStorage.removeItem("User");
    setUser(null);
  }, []);

  // ---------------- LOAD USER FROM LOCALSTORAGE ----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user, setUser,
        registerInfo, updateRegisterInfo, registerUser, registerError, isRegisterLoading,
        loginInfo, updateLoginInfo, loginUser, loginError, isLoginLoading,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
