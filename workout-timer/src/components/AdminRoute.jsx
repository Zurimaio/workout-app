import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute({ children }) {
  const { role } = useAuth();

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
