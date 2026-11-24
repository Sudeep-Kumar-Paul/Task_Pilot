import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { getFirebase, mockMode } from "@/firebase";
const AuthContext = createContext<{ user: User | null; loading: boolean; error: string | null }>({
  user: null,
  loading: true,
  error: null,
});
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!mockMode);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (mockMode) return;
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    void Promise.all([getFirebase(), import("firebase/auth")])
      .then(([{ auth }, { onAuthStateChanged }]) => {
        if (disposed) return;
        unsubscribe = onAuthStateChanged(
          auth,
          (next) => {
            setUser(next);
            setLoading(false);
          },
          () => {
            setError("Unable to verify your session. Please reload and try again.");
            setLoading(false);
          },
        );
      })
      .catch(() => {
        if (!disposed) {
          setError("Firebase is not configured. Add your web app settings to sign in.");
          setLoading(false);
        }
      });
    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, []);
  return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
