import { createContext, useState, useEffect } from "react";
import * as authService from "../services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("llm-academy-token");
    if (token) {
      authService.getMe()
        .then(setUser)
        .catch(() => authService.logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    await authService.login(email, password);
    const me = await authService.getMe();
    setUser(me);
    return me;
  };

  const register = async (email, password, profession) => {
    await authService.register(email, password, profession);
    const me = await authService.getMe();
    setUser(me);
    return me;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await authService.getMe();
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
