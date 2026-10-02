import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";
import VaultGate from "./VaultGate";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={"/"} replace />;
  }
  return (
    <VaultGate>
      <Outlet />
    </VaultGate>
  );
};

export default ProtectedRoute;
