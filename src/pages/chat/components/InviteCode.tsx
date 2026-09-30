import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { COPY_FEEDBACK_MS } from "../constants";

/** Invite code chip with copy-to-clipboard. */
const InviteCode: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the code is still visible.
    }
  };

  return (
    <button className="chat-invite" onClick={copy} title="Copy invite code">
      <span>Invite code</span>
      <code>{code}</code>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

export default InviteCode;
