import { useState } from "react";
import type { SignInPayload } from "@/src/lib/api/schemas";
import { PASSWORD_MIN_LENGTH } from "./constants";

interface SignInFormProps {
  onSubmit: (payload: SignInPayload) => void;
  isPending: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, isPending }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email: email.trim(), password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit" className="auth-form__submit" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
};

export default SignInForm;
