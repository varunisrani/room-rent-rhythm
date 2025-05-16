
import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "@/types/hostelTypes";
import { useToast } from "@/components/ui/use-toast";
import { ensureStorageBucket } from "@/lib/createStorageBucket";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  isManager: false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const { toast } = useToast();

  // Load user from localStorage on component mount and setup storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('pg_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log("Auth state restored:", parsedUser.role);
            
            // If user is admin, ensure storage bucket exists
            if (parsedUser.role === 'admin') {
              await ensureStorageBucket('accommodations');
            }
          } catch (error) {
            console.error("Failed to parse stored user:", error);
            localStorage.removeItem('pg_user');
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pg_user', JSON.stringify(userData));
    toast({
      title: "Login successful",
      description: `Logged in as ${userData.role}`,
    });
    console.log("User logged in:", userData.role);
    
    // If admin, ensure storage bucket exists
    if (userData.role === 'admin') {
      ensureStorageBucket('accommodations');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pg_user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isManager, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
