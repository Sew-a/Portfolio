import { useState } from "react";
import type { SignUpPayload } from "@/src/lib/api/schemas";
import AvatarPicker from "./AvatarPicker";
import { PASSWORD_MIN_LENGTH } from "./constants";

interface SignUpFormProps {
  onSubmit: (payload: SignUpPayload, avatar: File | null) => void;
  isPending: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, isPending }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      {
        username: username.trim(),
        email: email.trim(),
        password,
      },
      avatar,
    );
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__field">
        <span>Profile picture (optional)</span>
        <AvatarPicker
          name={username}
          file={avatar}
          onPick={setAvatar}
          onRemove={() => setAvatar(null)}
          disabled={isPending}
        />
      </div>
      <label className="auth-form__field">
        <span>Username</span>
        <input
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label className="auth-form__field">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="auth-form__field">
        <span>Password</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit" className="auth-form__submit" disabled={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
};

export default SignUpForm;
