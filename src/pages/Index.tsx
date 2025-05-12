
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  // Redirect to dashboard if logged in as admin, residents if manager, otherwise to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return user.role === 'admin' 
    ? <Navigate to="/dashboard" replace /> 
    : <Navigate to="/residents" replace />;
};

export default Index;
