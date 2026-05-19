"use client";

import { type ReactNode } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import Dock, { type DockItemData } from "@/app/components/ui/Dock";
import { 
  LayoutDashboard, 
  User, 
  Mail, 
  MessageSquare, 
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

interface MainLayoutProps {
  children?: ReactNode;
  className?: string;
  showSidebar?: boolean;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const dockItems: DockItemData[] = [
    {
      icon: <LayoutDashboard size={24} />,
      label: "Dashboard",
      onClick: () => navigate("/app"),
      className: location.pathname === "/app" ? "bg-[var(--color-accent)]/20" : "",
    },
    {
      icon: <User size={24} />,
      label: "Profile",
      onClick: () => navigate("/app/profile"),
      className: location.pathname === "/app/profile" ? "bg-[var(--color-accent)]/20" : "",
    },
    {
      icon: <Mail size={24} />,
      label: "Requests",
      onClick: () => navigate("/app/requests"),
      className: location.pathname === "/app/requests" ? "bg-[var(--color-accent)]/20" : "",
    },
    {
      icon: <MessageSquare size={24} />,
      label: "Chat",
      onClick: () => navigate("/app/chat"),
      className: location.pathname === "/app/chat" ? "bg-[var(--color-accent)]/20" : "",
    },
    {
      icon: <Settings size={24} />,
      label: "Settings",
      onClick: () => navigate("/app/settings"),
      className: location.pathname === "/app/settings" ? "bg-[var(--color-accent)]/20" : "",
    },
    {
      icon: <LogOut size={24} />,
      label: "Logout",
      onClick: () => {
        logout();
        navigate("/");
      },
      className: "text-red-400",
    },
  ];

  return (
    <div className={cn("min-h-screen bg-[var(--color-bg)] pb-24", className)}>
      <main className="flex-1 min-h-screen">
        {children || <Outlet />}
      </main>
      <Dock items={dockItems} />
    </div>
  );
}
