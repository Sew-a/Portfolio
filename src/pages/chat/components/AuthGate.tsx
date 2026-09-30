import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useAuthStore } from "@/src/store/useAuthStore";

/** Renders children for signed-in users; otherwise prompts sign-in and opens the popup once. */
const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  useEffect(() => {
    if (!token) openAuthModal("signin");
    // Only on entering the page signed-out — closing the popup shouldn't reopen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (token) return <>{children}</>;

  return (
    <div className="chat-empty">
      <MessageCircle size={32} />
      <h2>Sign in to chat</h2>
      <p>Create a group or join one with an invite code.</p>
      <button className="chat-btn chat-btn--primary" onClick={() => openAuthModal("signin")}>
        Sign in
      </button>
    </div>
  );
};

export default AuthGate;
