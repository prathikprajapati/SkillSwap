"use client";

import { Outlet } from "react-router";
import { MainLayout } from "./main-layout";

export function DashboardLayout() {
  return (
    <MainLayout showSidebar={true}>
      <Outlet />
    </MainLayout>
  );
}
