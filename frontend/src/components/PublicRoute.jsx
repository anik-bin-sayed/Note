import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    const returnPath = sessionStorage.getItem("postLoginPath");
    if (returnPath) sessionStorage.removeItem("postLoginPath");
    return <Navigate to={returnPath || "/dashboard"} replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
