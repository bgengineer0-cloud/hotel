import React, { createContext, useContext, useState } from "react";
import { db } from "../database/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");

  const login = (email, password) => {
    const found = db.findUserByEmail(email);
    if (found && found.password === password) {
      setUser(found);
      setAuthError("");
      return { ok: true, user: found };
    }
    setAuthError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    return { ok: false };
  };

  const register = ({ name, email, phone, password }) => {
    if (db.findUserByEmail(email)) {
      return { ok: false, error: "البريد الإلكتروني مستخدم بالفعل" };
    }
    const newUser = db.createUser({ name, email, phone, password });
    setUser(newUser);
    return { ok: true, user: newUser };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
