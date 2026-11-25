import React from "react";
import { AuthProvider } from "./hooks/useAuth";
import { RouterProvider, useCurrentRoute } from "./context/RouterContext";
import { Workspace } from "./components/taskpilot/Workspace";
import { LoginPage } from "./components/taskpilot/LoginPage";
import ClickSpark from "./components/bits/ClickSpark/ClickSpark";
import DotField from "./components/bits/DotField/DotField";
import "./styles.css";

function AppContent() {
  const route = useCurrentRoute();
  return (
    <ClickSpark sparkColor="#f95721" sparkSize={8} sparkCount={7} duration={350} extraScale={1.1}>
      <div className="relative min-h-screen bg-[#000000] text-white selection:bg-[#f95721]/30">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-35">
          <DotField
            dotRadius={1.1}
            dotSpacing={26}
            pattern="grid"
            glowColor="#f95721"
            glowRadius={80}
            glowIntensity={0.2}
            baseOpacity={0.06}
            interactive={true}
          />
        </div>
        <div className="relative z-10">
          {route === "/auth" ? <LoginPage /> : <Workspace />}
        </div>
      </div>
    </ClickSpark>
  );
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
