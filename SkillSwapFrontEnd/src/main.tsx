
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { AuthProvider } from "./app/contexts/AuthContext";
  import { SocketProvider } from "./contexts/SocketContext";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  );
  