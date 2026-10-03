import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";
import VaultGate from "./VaultGate";

const ProtectedRoute = ({ requireVault = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
        replace
      />
    );
  }
  return requireVault ? (
    <VaultGate>
      <Outlet />
    </VaultGate>
  ) : (
    <Outlet />
  );
};

export default ProtectedRoute;
