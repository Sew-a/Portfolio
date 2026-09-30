import { useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/src/hooks/useBodyScrollLock";
import { useAuth } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/store/useAuthStore";
import type { AuthMode } from "@/src/store/types";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { AUTH_TABS } from "./constants";
import "./styles.scss";

/** Sign in / sign up popup. Rendered inside the theme wrapper so it follows the theme. */
const AuthModal: React.FC = () => {
  const mode = useAuthStore((s) => s.authMode);
  const setAuthMode = useAuthStore((s) => s.setAuthMode);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const auth = useAuth();

  const close = useCallback(() => closeAuthModal(), [closeAuthModal]);
  useEscapeKey(close);
  useBodyScrollLock(true);

  const switchMode = (next: AuthMode) => {
    auth.clearError();
    setAuthMode(next);
  };

  return (
    <motion.div
      className="auth-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={close}
    >
      <motion.div
        className="auth-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="auth-modal__close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>

        <h2 id="auth-modal-title" className="auth-modal__title">
          {AUTH_TABS.find((t) => t.mode === mode)?.title}
        </h2>

        <div className="auth-modal__tabs" role="tablist">
          {AUTH_TABS.map((tab) => (
            <button
              key={tab.mode}
              role="tab"
              aria-selected={mode === tab.mode}
              className={`auth-modal__tab ${mode === tab.mode ? "auth-modal__tab--active" : ""}`}
              onClick={() => switchMode(tab.mode)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "signin" ? (
          <SignInForm onSubmit={auth.signIn} isPending={auth.isPending} />
        ) : (
          <SignUpForm onSubmit={auth.signUp} isPending={auth.isPending} />
        )}

        {auth.error && (
          <p className="auth-modal__error" role="alert">
            {auth.error}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
