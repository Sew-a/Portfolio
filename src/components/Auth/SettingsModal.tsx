import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/src/hooks/useBodyScrollLock";
import { useProfileSettings } from "@/src/hooks/useProfileSettings";
import { useAuthStore } from "@/src/store/useAuthStore";
import AvatarPicker from "./AvatarPicker";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "./constants";
import "./styles.scss";

/** Account settings popup: change avatar (upload from device / remove) and username. */
const SettingsModal: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const closeSettings = useAuthStore((s) => s.closeSettings);
  const settings = useProfileSettings();
  const [username, setUsername] = useState(user?.username ?? "");

  const close = useCallback(() => closeSettings(), [closeSettings]);
  useEscapeKey(close);
  useBodyScrollLock(true);

  if (!user) return null;

  const trimmed = username.trim();
  const canSaveUsername =
    trimmed !== user.username &&
    trimmed.length >= USERNAME_MIN_LENGTH &&
    trimmed.length <= USERNAME_MAX_LENGTH;

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSaveUsername) settings.changeUsername(trimmed);
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
        aria-labelledby="settings-modal-title"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="auth-modal__close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>

        <h2 id="settings-modal-title" className="auth-modal__title">
          Settings
        </h2>

        <section className="settings-section">
          <h3 className="settings-section__title">Profile picture</h3>
          <AvatarPicker
            name={user.username}
            currentSrc={user.avatarUrl}
            onPick={settings.changeAvatar}
            onRemove={settings.removeAvatar}
            disabled={settings.isPending}
          />
        </section>

        <section className="settings-section">
          <h3 className="settings-section__title">Username</h3>
          <form className="settings-section__row" onSubmit={handleUsernameSubmit}>
            <input
              aria-label="Username"
              autoComplete="username"
              minLength={USERNAME_MIN_LENGTH}
              maxLength={USERNAME_MAX_LENGTH}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              type="submit"
              className="auth-form__submit"
              disabled={!canSaveUsername || settings.isPending}
            >
              Save
            </button>
          </form>
          <span className="settings-section__hint">
            {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} characters
          </span>
        </section>

        {settings.isPending && <p className="settings-section__status">Saving…</p>}
        {settings.notice && !settings.isPending && (
          <p className="settings-section__status settings-section__status--ok" role="status">
            {settings.notice}
          </p>
        )}
        {settings.error && (
          <p className="auth-modal__error" role="alert">
            {settings.error}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;
