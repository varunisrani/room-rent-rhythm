
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'manager'>;
}

export const RouteGuard = ({ children, allowedRoles = ['admin', 'manager'] }: RouteGuardProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is logged in but doesn't have the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in and has the required role, render children
  return <>{children}</>;
};
