
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // If already logged in, redirect to appropriate page
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting...");
      if (user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'manager') {
        navigate('/residents', { replace: true });
      }
    }
  }, [user, navigate]);

  const onSubmit = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);

      // First check pg_manage table for managers
      const { data: managers, error: managerError } = await supabase
        .from("pg_manage")
        .select("*")
        .eq("name", values.username);

      if (!managerError && managers && managers.length > 0) {
        const manager = managers[0];
        
        // Check password for manager
        if (manager.password === values.password) {
          // Manager login successful
          login({
            id: manager.id,
            username: manager.name,
            role: 'manager',
            created_at: new Date().toISOString()
          });
          
          console.log("Manager login successful, redirecting to residents...");
          navigate("/residents");
          return;
        } else {
          throw new Error("Invalid username or password");
        }
      }

      // If not found in pg_manage, check users table for admins
      const { data: admins, error: adminError } = await supabase
        .from("users")
        .select("*")
        .eq("username", values.username);

      if (adminError) {
        throw new Error("Error fetching user data");
      }

      if (!admins || admins.length === 0) {
        throw new Error("Invalid username or password");
      }

      const admin = admins[0];

      // Check password for admin
      if (admin.password !== values.password) {
        throw new Error("Invalid username or password");
      }

      // Admin login successful
      login({
        id: admin.id.toString(),
        username: admin.username,
        role: 'admin',
        created_at: admin.created_at
      });
      
      console.log("Admin login successful, redirecting to dashboard...");
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-premium-50 to-premium-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-2.5 rounded-md bg-gradient-to-br from-premium-accent to-premium-highlight">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h.01" />
                <path d="M17 7h.01" />
                <path d="M7 17h.01" />
                <path d="M17 17h.01" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">PG Manager Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Enter your username" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          className="pl-10" 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full mt-2" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Demo credentials:</p>
            <p>Admin: Use Users table credentials</p>
            <p>Manager: Use PG Manage table credentials</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
