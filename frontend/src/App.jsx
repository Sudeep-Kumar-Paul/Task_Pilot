import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AuthProvider } from "./hooks/useAuth";
import { RouterProvider, useCurrentRoute } from "./context/RouterContext";
import { IntroProvider, useIntro } from "./context/IntroContext";
import { Workspace } from "./components/taskpilot/Workspace";
import { LoginPage } from "./components/taskpilot/LoginPage";
import ClickSpark from "./components/bits/ClickSpark/ClickSpark";
import DotField from "./components/bits/DotField/DotField";
import Waves from "./components/bits/Waves/Waves";
import ParticleTitle from "./components/bits/ParticleTitle/ParticleTitle";
import "./styles.css";

function IntroOverlay() {
  const { showIntro, manualReplay, dismissIntro } = useIntro();

  useEffect(() => {
    if (!showIntro) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismissIntro();
      }
    };

    const onWheel = (e) => {
      if (e.deltaY > 12) {
        dismissIntro();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: true });

    let timer;
    if (!manualReplay) {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      timer = window.setTimeout(dismissIntro, reduced ? 2200 : 5800);
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
      if (timer) window.clearTimeout(timer);
    };
  }, [showIntro, manualReplay, dismissIntro]);

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          key="taskpilot-intro-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onClick={dismissIntro}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0c0e] cursor-pointer select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Task Pilot welcome animation"
        >
          <div className="w-full max-w-5xl px-4">
            <ParticleTitle text="Task Pilot" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-2 flex flex-col items-center gap-3"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Your browser, on autopilot
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismissIntro();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md transition hover:border-[#f95721]/40 hover:bg-[#f95721]/10 hover:text-white"
            >
              <span>{manualReplay ? "Return to workspace" : "Enter workspace"}</span>
              <span className="text-[#f95721]">→</span>
            </button>
          </motion.div>

          {!manualReplay && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 5.8, ease: "linear" }}
                style={{ transformOrigin: "left" }}
                className="h-full w-full bg-gradient-to-r from-[#f95721]/40 via-[#f95721] to-[#f95721]/60"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AppContent() {
  const route = useCurrentRoute();
  return (
    <ClickSpark sparkColor="#f95721" sparkSize={8} sparkCount={7} duration={350} extraScale={1.1}>
      <div className="relative min-h-screen bg-[#000000] text-white selection:bg-[#f95721]/30">
        <IntroOverlay />

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
        <IntroProvider>
          <AppContent />
        </IntroProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
