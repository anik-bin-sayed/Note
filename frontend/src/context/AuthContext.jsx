import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../lib/api";
import { noteApi } from "../lib/features/noteApi";
import { clearVaultKey } from "../lib/vaultCrypto";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/auth/me");

      setUser(response.data);
    } catch (error) {
      clearVaultKey();
      dispatch(noteApi.util.resetApiState());
      setUser(null);
      console.log("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      clearVaultKey();
      dispatch(noteApi.util.resetApiState());
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get("/api/auth/me")
      .then(({ data }) => {
        if (active) setUser(data);
      })
      .catch((error) => {
        if (!active) return;
        clearVaultKey();
        dispatch(noteApi.util.resetApiState());
        setUser(null);
        console.log("Auth check failed:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch]);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
