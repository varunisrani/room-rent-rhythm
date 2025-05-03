
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Residents", path: "/residents" },
  { name: "Rooms", path: "/rooms" },
  { name: "Billing", path: "/billing" },
  { name: "Electricity", path: "/electricity" },
  { name: "Reports", path: "/reports" },
];

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h.01" />
              <path d="M17 7h.01" />
              <path d="M7 17h.01" />
              <path d="M17 17h.01" />
            </svg>
            PG Manager
          </div>
        </div>
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} name={item.name} />
          ))}
        </nav>
        <div className="flex items-center">
          <Link to="/settings" className="flex items-center px-2 py-1 text-sm hover:text-gray-700">
            <Settings className="h-5 w-5" />
            <span className="ml-2">Settings</span>
          </Link>
        </div>
      </div>
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
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-black font-medium" : "text-muted-foreground"
      )}
    >
      {name}
    </Link>
  );
}
