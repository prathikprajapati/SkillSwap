"use client";

import { type ReactNode } from "react";
import { Outlet } from "react-router";

interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="flex items-center justify-center min-h-screen px-4">
        {children || <Outlet />}
      </div>
    </div>
  );
}
