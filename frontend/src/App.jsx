import React from "react";
import { AuthProvider } from "./hooks/useAuth";
import { RouterProvider, useCurrentRoute } from "./context/RouterContext";
import { Workspace } from "./components/taskpilot/Workspace";
import { LoginPage } from "./components/taskpilot/LoginPage";
import ClickSpark from "./components/bits/ClickSpark/ClickSpark";
import DotField from "./components/bits/DotField/DotField";
import Waves from "./components/bits/Waves/Waves";
import "./styles.css";

function AppContent() {
  const route = useCurrentRoute();
  return (
    <ClickSpark sparkColor="#f95721" sparkSize={8} sparkCount={7} duration={350} extraScale={1.1}>
      <div className="relative min-h-screen bg-[#000000] text-white selection:bg-[#f95721]/30">
        {/* Layered Cyber-Nocturnal Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle Ambient Radial Lighting */}
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: `
                radial-gradient(circle 900px at 50% 12%, rgba(249, 87, 33, 0.12), transparent 70%),
                radial-gradient(circle 1000px at 50% 85%, rgba(249, 87, 33, 0.08), transparent 75%),
                radial-gradient(ellipse 1400px 700px at 50% 50%, rgba(12, 12, 15, 0.85), rgba(0, 0, 0, 1))
              `
            }}
          />

          {/* Interactive Flowing WebGL Waves */}
          <div className="absolute inset-0 opacity-35">
            <Waves
              lineColor="rgba(255, 255, 255, 0.08)"
              accentColor="#f95721"
              backgroundColor="transparent"
              amplitude={24}
              speed={0.16}
              spacing={22}
              lineWidth={1.2}
              mouseInteraction={true}
              mouseRadius={140}
              mouseStrength={0.45}
            />
          </div>

          {/* Interactive Dot Field */}
          <div className="absolute inset-0 opacity-35">
            <DotField
              dotRadius={1.1}
              dotSpacing={28}
              pattern="grid"
              glowColor="#f95721"
              glowRadius={90}
              glowIntensity={0.25}
              baseOpacity={0.05}
              interactive={true}
            />
          </div>

          {/* Subtle Cyber Grid Matrix */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
              backgroundSize: "48px 48px"
            }}
          />

          {/* Vignette Edge Shading */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.8) 100%)"
            }}
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
