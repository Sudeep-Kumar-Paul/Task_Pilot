import React from "react";
import { AuthProvider } from "./hooks/useAuth";
import { RouterProvider, useCurrentRoute } from "./context/RouterContext";
import { Workspace } from "./components/taskpilot/Workspace";
import { LoginPage } from "./components/taskpilot/LoginPage";
import "./styles.css";

function AppContent() {
  const route = useCurrentRoute();
  if (route === "/auth") {
    return <LoginPage />;
  }
  return <Workspace />;
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RouterProvider>
  );
}
