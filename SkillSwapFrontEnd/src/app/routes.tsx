import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { RootLayout } from "@/app/components/RootLayout";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { AuthLayout } from "@/layouts/auth-layout";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import type { ReactNode } from "react";

// Lazy load pages for better performance (code splitting)
const Home = lazy(() => import("@/app/pages/Home"));
const AuthPage = lazy(() => import("@/app/pages/AuthPage"));
const Dashboard = lazy(() => import("@/app/pages/Dashboard"));
const Profile = lazy(() => import("@/app/pages/Profile"));
const Messages = lazy(() => import("@/app/pages/Messages"));
const BrowseSkills = lazy(() => import("@/app/pages/BrowseSkills"));
const SkillDetail = lazy(() => import("@/app/pages/SkillDetail"));
const CreateSkill = lazy(() => import("@/app/pages/CreateSkill"));
const Settings = lazy(() => import("@/app/pages/Settings"));
const Schedule = lazy(() => import("@/app/pages/Schedule"));
const RequestsPage = lazy(() => import("@/app/pages/RequestsPage"));
const Exchanges = lazy(() => import("@/app/pages/Exchanges"));

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

// Layout wrapper that includes ThemeProvider
interface LayoutWithThemeProps {
  children: ReactNode;
}

const LayoutWithTheme = ({ children }: LayoutWithThemeProps) => (
  <ThemeProvider>
    <RootLayout />
  </ThemeProvider>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutWithTheme />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "browse",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <BrowseSkills />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "skill/:id",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SkillDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "create",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <CreateSkill />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "auth",
        element: (
          <AuthLayout>
            <Suspense fallback={<PageLoader />}>
              <AuthPage />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:username",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Messages />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "schedule",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Schedule />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "requests",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <RequestsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "exchanges",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Exchanges />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
