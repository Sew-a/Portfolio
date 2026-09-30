import { useState } from "react";

interface JoinGroupFormProps {
  onJoin: (inviteCode: string) => void;
  isPending: boolean;
}

const JoinGroupForm: React.FC<JoinGroupFormProps> = ({ onJoin, isPending }) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoin(code.trim().toUpperCase());
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <h3>Join with invite code</h3>
      <div className="chat-form__row">
        <input
          placeholder="e.g. K7M2P9QX"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" className="chat-btn" disabled={isPending}>
          Join
        </button>
      </div>
    </form>
  );
};

export default JoinGroupForm;
