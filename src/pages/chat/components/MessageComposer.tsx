import { useState } from "react";
import { SendHorizontal } from "lucide-react";

const MessageComposer: React.FC<{ onSend: (content: string) => void }> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form className="chat-room__composer" onSubmit={handleSubmit}>
      <input
        placeholder="Write a message…"
        aria-label="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      <button
        type="submit"
        className="chat-btn chat-btn--primary"
        disabled={!text.trim()}
        aria-label="Send message"
      >
        <SendHorizontal size={16} />
      </button>
    </form>
  );
};

export default MessageComposer;
