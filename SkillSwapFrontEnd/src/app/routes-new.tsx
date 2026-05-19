import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { AuthLayout } from "@/layouts/auth-layout";

// Lazy load pages for better performance (code splitting)
const LandingPage = lazy(() => import("@/pages/landing-page"));
const SigninPage = lazy(() => import("@/pages/signin-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
// TODO: Create these pages
const ProfilePage = lazy(() => import("@/app/pages/ProfilePage").then(m => ({ default: m.default })));
const RequestsPage = lazy(() => import("@/app/pages/RequestsPage").then(m => ({ default: m.default })));
const ChatPage = lazy(() => import("@/app/pages/ChatPage").then(m => ({ default: m.default })));
const SettingsPage = lazy(() => import("@/app/pages/SettingsPage").then(m => ({ default: m.default })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
          style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
        />
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: "/auth",
    element: (
      <AuthLayout>
        <Suspense fallback={<PageLoader />}>
          <SigninPage />
        </Suspense>
      </AuthLayout>
    ),
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "requests",
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequestsPage />
          </Suspense>
        ),
      },
      {
        path: "chat",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChatPage />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);
