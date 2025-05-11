
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  // Redirect to dashboard if logged in, otherwise to auth
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
};

export default Index;
