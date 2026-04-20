import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FullPageLoader } from "../components/Feedback";

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <FullPageLoader label="Restoring your session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate
        to={user?.role === "recruiter" ? "/employer-dashboard" : "/find-jobs"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
