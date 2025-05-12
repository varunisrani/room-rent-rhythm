
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  // If not logged in, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect based on role
  if (user.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  } else if (user.role === 'manager') {
    return <Navigate to="/residents" replace />;
  } else {
    // Fallback for any other role
    return <Navigate to="/residents" replace />;
  }
};

export default Index;
