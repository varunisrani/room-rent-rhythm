import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Residents from "./pages/Residents";
import Rooms from "./pages/Rooms";
import Billing from "./pages/Billing";
import Electricity from "./pages/Electricity";
import Reports from "./pages/Reports";
import Accommodations from "./pages/Accommodations"; // Add this import
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import PGUsers from "./pages/PGUsers";
import Gallery from "./pages/Gallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <RouteGuard allowedRoles={['admin']}>
                <Layout><Dashboard /></Layout>
              </RouteGuard>
            } />
            <Route path="/residents" element={
              <RouteGuard>
                <Layout><Residents /></Layout>
              </RouteGuard>
            } />
            <Route path="/rooms" element={
              <RouteGuard>
                <Layout><Rooms /></Layout>
              </RouteGuard>
            } />
            <Route path="/billing" element={
              <RouteGuard>
                <Layout><Billing /></Layout>
              </RouteGuard>
            } />
            <Route path="/electricity" element={
              <RouteGuard>
                <Layout><Electricity /></Layout>
              </RouteGuard>
            } />
            <Route path="/reports" element={
              <RouteGuard allowedRoles={['admin']}>
                <Layout><Reports /></Layout>
              </RouteGuard>
            } />
            {/* Add new route for accommodations, restricted to admins */}
            <Route path="/accommodations" element={
              <RouteGuard allowedRoles={['admin']}>
                <Layout><Accommodations /></Layout>
              </RouteGuard>
            } />
            <Route path="/users" element={
              <RouteGuard allowedRoles={['admin']}>
                <Layout><Users /></Layout>
              </RouteGuard>
            } />
            <Route path="/pg-users" element={
              <RouteGuard allowedRoles={['admin']}>
                <Layout><PGUsers /></Layout>
              </RouteGuard>
            } />
            <Route path="/pg-user" element={<Navigate to="/pg-users" replace />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
