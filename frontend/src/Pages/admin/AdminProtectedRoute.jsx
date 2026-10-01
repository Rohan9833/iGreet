import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminToken } from "../../api/adminAuth.api";

export default function AdminProtectedRoute() {
  const location = useLocation();

  if (!getAdminToken()) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
