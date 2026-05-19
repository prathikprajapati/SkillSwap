import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { SkipNavigation } from "@/app/components/SkipNavigation";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { useServiceWorker } from "@/app/hooks/useServiceWorker";
import { useEffect } from "react";

/**
 * ServiceWorkerRegistration - Registers service worker for offline support
 */
function ServiceWorkerRegistration() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (isUpdateAvailable) {
      console.log("[App] Service Worker update available");
    }
  }, [isUpdateAvailable]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <SkipNavigation />
          <ServiceWorkerRegistration />
          <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
            <RouterProvider router={router} />
          </main>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

