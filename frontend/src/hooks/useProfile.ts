import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getFirebase, mockMode } from "@/firebase";
import { EMPTY_PROFILE, type Profile } from "@/lib/taskpilot/protocol";
export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile>({ ...EMPTY_PROFILE });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let disposed = false;
    setProfile({ ...EMPTY_PROFILE, email: user?.email ?? "" });
    setSaved(false);
    setError(null);
    if (!user || mockMode) return;
    setLoading(true);
    void Promise.all([getFirebase(), import("firebase/firestore")])
      .then(async ([{ db }, { doc, getDoc }]) => {
        const snapshot = await getDoc(doc(db, "profiles", user.uid));
        const data = snapshot.data();
        if (disposed || !data) return;
        setProfile({
          name: typeof data["name"] === "string" ? data["name"] : "",
          email: typeof data["email"] === "string" ? data["email"] : (user.email ?? ""),
          phone: typeof data["phone"] === "string" ? data["phone"] : "",
          address: typeof data["address"] === "string" ? data["address"] : "",
        });
      })
      .catch(() => {
        if (!disposed)
          setError(
            "Could not load your profile. Check that Firestore and its access rules are configured.",
          );
      })
      .finally(() => {
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
    };
  }, [user]);
  async function save() {
    if (!user || mockMode) {
      setError("Demo details stay in this session. Sign in with Firebase to save your profile.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const [{ db }, { doc, setDoc, serverTimestamp }] = await Promise.all([
        getFirebase(),
        import("firebase/firestore"),
      ]);
      await setDoc(doc(db, "profiles", user.uid), { ...profile, updatedAt: serverTimestamp() });
      setSaved(true);
    } catch {
      setError("Could not save your profile. Check your connection and Firestore access rules.");
    } finally {
      setSaving(false);
    }
  }
  function update(key: keyof Profile, value: string) {
    setProfile((old) => ({ ...old, [key]: value }));
    setSaved(false);
  }
  return { profile, loading, saving, saved, error, save, update };
}
