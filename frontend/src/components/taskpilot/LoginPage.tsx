import { ArrowRight, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate, useRouter } from "@/context/RouterContext";
import { Button } from "@/components/ui/button";
import { authError, firebaseConfigured, getFirebase, mockMode } from "@/firebase";
import { Brand } from "./Header";
function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}
export function LoginPage() {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const router = useRouter();
  async function login(google = false) {
    if (pending) return;
    if (!firebaseConfigured) {
      setError("Firebase settings are blank. Add your web app configuration to enable sign-in.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const [{ auth }, sdk] = await Promise.all([getFirebase(), import("firebase/auth")]);
      if (google) await sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider());
      else if (signup) await sdk.createUserWithEmailAndPassword(auth, email.trim(), password);
      else await sdk.signInWithEmailAndPassword(auth, email.trim(), password);
      await router.invalidate();
      await navigate({ to: "/", replace: true });
    } catch (error) {
      setError(authError(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="login-page">
      <header className="login-header">
        <Brand />
        {mockMode && (
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
            Back to demo
            <ArrowRight size={14} />
          </Button>
        )}
      </header>
      <main className="login-main">
        <span className="login-symbol">
          <LockKeyhole size={25} />
        </span>
        <div className="section-eyebrow">YOUR BROWSER, ON AUTOPILOT</div>
        <h1>{signup ? "Let’s get you started." : "Welcome back."}</h1>
        <p className="login-subtitle">
          {signup ? "A little less busywork starts here." : "Your next task is one sign-in away."}
        </p>
        <div className="login-form">
          <Button variant="google" onClick={() => void login(true)} disabled={pending}>
            <GoogleLogo />
            Continue with Google
          </Button>
          <div className="login-or">
            <span />
            or continue with email
            <span />
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void login();
            }}
          >
            <label>
              Email address
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={pending}
                />
              </div>
            </label>
            <label>
              Password
              <div className="input-with-icon">
                <LockKeyhole size={16} />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={signup ? "new-password" : "current-password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={pending}
                />
              </div>
            </label>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="login-submit" disabled={pending}>
              {pending ? <Loader2 size={17} className="spin" /> : null}
              {pending ? "Please wait…" : signup ? "Create account" : "Sign in"}
              {!pending && <ArrowRight size={16} />}
            </Button>
          </form>
          <div className="login-switch">
            {signup ? "Already have an account?" : "New to TaskPilot?"}
            <Button
              variant="link"
              size="sm"
              disabled={pending}
              onClick={() => {
                setSignup(!signup);
                setError(null);
              }}
            >
              {signup ? "Sign in" : "Create account"}
            </Button>
          </div>
          {!firebaseConfigured && (
            <div className="setup-notice">
              <span className="status-dot" />
              <p>Firebase configuration is pending. The mock workspace is ready to explore.</p>
            </div>
          )}
        </div>
        <span className="login-footer">
          <LockKeyhole size={12} /> A private workspace. A capable copilot.
        </span>
      </main>
    </div>
  );
}
