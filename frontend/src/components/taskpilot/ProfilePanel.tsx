import { Check, Loader2, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { mockMode } from "@/firebase";
import type { useProfile } from "@/hooks/useProfile";
export function ProfilePanel({
  state,
  close,
}: {
  state: ReturnType<typeof useProfile>;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="profile-dialog"
      onCancel={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="dialog-heading">
        <div>
          <span className="dialog-icon">
            <UserRound size={20} />
          </span>
          <h2>Autofill profile</h2>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close profile" onClick={close}>
          <X size={18} />
        </Button>
      </div>
      <p className="dialog-description">Your details, ready when a form needs them.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void state.save();
        }}
      >
        <div className="profile-fields">
          {(["name", "email", "phone", "address"] as const).map((key) => (
            <label key={key}>
              {key === "name"
                ? "Full name"
                : key === "email"
                  ? "Email address"
                  : key === "phone"
                    ? "Phone number"
                    : "Address"}
              {key === "address" ? (
                <textarea
                  value={state.profile[key]}
                  maxLength={2000}
                  autoComplete="street-address"
                  onChange={(event) => state.update(key, event.target.value)}
                  disabled={state.loading || state.saving}
                />
              ) : (
                <input
                  type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                  value={state.profile[key]}
                  maxLength={key === "name" ? 200 : key === "email" ? 320 : 40}
                  autoComplete={key === "name" ? "name" : key === "phone" ? "tel" : "email"}
                  onChange={(event) => state.update(key, event.target.value)}
                  disabled={state.loading || state.saving}
                />
              )}
            </label>
          ))}
        </div>
        {state.error && (
          <p className="error-text" role="alert">
            {state.error}
          </p>
        )}
        <div className="profile-note">
          <ShieldCheck size={14} />
          <span>
            {mockMode
              ? "Demo details stay in this session only."
              : "Saved privately to your Firebase account."}
          </span>
        </div>
        <div className="dialog-actions">
          {mockMode ? (
            <Button onClick={close}>
              Use these details
              <Check size={15} />
            </Button>
          ) : (
            <Button type="submit" disabled={state.loading || state.saving}>
              {state.saving ? (
                <Loader2 className="spin" size={15} />
              ) : state.saved ? (
                <Check size={15} />
              ) : (
                <Save size={15} />
              )}
              {state.saving ? "Saving…" : state.saved ? "Profile saved" : "Save profile"}
            </Button>
          )}
        </div>
      </form>
    </dialog>
  );
}
