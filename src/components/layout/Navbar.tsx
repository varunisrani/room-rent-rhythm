
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Dashboard", path: "/dashboard", roles: ["admin"] },
  { name: "Residents", path: "/residents", roles: ["admin", "manager"] },
  { name: "Rooms", path: "/rooms", roles: ["admin", "manager"] },
  { name: "Billing", path: "/billing", roles: ["admin", "manager"] },
  { name: "Electricity", path: "/electricity", roles: ["admin", "manager"] },
  { name: "Reports", path: "/reports", roles: ["admin"] },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || "")
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center">
            <div className="text-xl font-bold flex items-center">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-premium-accent to-premium-highlight mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
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
              <span className="bg-gradient-to-r from-premium-700 to-premium-accent bg-clip-text text-transparent font-bold">
                PG Manager
              </span>
              <span className="ml-1 text-xs bg-premium-accent/10 text-premium-accent rounded-md px-1.5 py-0.5">PRO</span>
            </div>
          </Link>
        </div>
        
        {/* Mobile Menu */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {filteredNavItems.map((item) => (
            <NavLink key={item.path} to={item.path} name={item.name} />
          ))}
        </nav>
        
        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 border border-gray-200 cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.username} ({user?.role})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <motion.div 
          className="md:hidden bg-white border-b shadow-md"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 py-3 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t my-2"></div>
            <button
              className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 inline" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
}

function NavLink({ to, name }: { to: string; name: string }) {
  const pathname = window.location.pathname;
  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={cn(
        "relative text-sm font-medium transition-colors hover:text-premium-accent",
        isActive 
          ? "text-premium-accent font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-premium-accent" 
          : "text-premium-700"
      )}
    >
      {name}
    </Link>
  );
}
