
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'manager'>;
}

export const RouteGuard = ({ children, allowedRoles = ['admin', 'manager'] }: RouteGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state if authentication state is still being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-accent mx-auto"></div>
          <p className="mt-2 text-premium-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    console.log("RouteGuard: User not logged in, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is logged in but doesn't have the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`RouteGuard: User role ${user.role} not allowed for ${location.pathname}, redirecting`);
    
    // If trying to access admin-only page
    if (user.role === 'manager') {
      // For managers, redirect to residents page which they can access
      return <Navigate to="/residents" replace />;
    }
    
    // Generic fallback
    return <Navigate to="/dashboard" replace />;
  }

  console.log(`RouteGuard: Access granted for role ${user.role} to ${location.pathname}`);
  // If user is logged in and has the required role, render children
  return <>{children}</>;
};
