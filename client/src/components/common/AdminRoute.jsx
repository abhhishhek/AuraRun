import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export function AdminRoute() {
  const { user } = useSelector((s) => s.auth);
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
