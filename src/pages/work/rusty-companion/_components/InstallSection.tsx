import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { HeadingText } from "@/src/components/UI";
import {
  INSTALL_COPY,
  INSTALL_HEADING,
  INSTALL_STEPS,
  REQUIREMENTS,
} from "@/src/pages/work/rusty-companion/constants";

/** Terminal-style install steps with copy buttons, next to the requirements. */
export default function InstallSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      setTimeout(() => setCopied((c) => (c === command ? null : c)), 1600);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section className="rusty-install" id="install">
      <HeadingText title={INSTALL_HEADING.title} label={INSTALL_HEADING.label} />
      <div className="rusty-install__layout">
        <div className="rusty-install__terminal">
          <div className="rusty-install__bar">
            <span className="rusty-stage__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{INSTALL_COPY.terminalTitle}</span>
          </div>
          <ol className="rusty-install__steps">
            {INSTALL_STEPS.map((step, index) => (
              <li key={step.command} className="rusty-install__step">
                <span className="rusty-install__comment">
                  # {index + 1}. {step.comment}
                </span>
                <div className="rusty-install__line">
                  <code>
                    <span className="rusty-install__prompt">&gt;</span> {step.command}
                  </code>
                  <button
                    type="button"
                    className="rusty-install__copy"
                    onClick={() => copy(step.command)}
                    aria-label={`${INSTALL_COPY.copy}: ${step.command}`}
                  >
                    {copied === step.command ? <Check size={14} /> : <Copy size={14} />}
                    {copied === step.command ? INSTALL_COPY.copied : INSTALL_COPY.copy}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rusty-install__needs">
          <h3>{INSTALL_COPY.requirementsTitle}</h3>
          <ul>
            {REQUIREMENTS.map((req) => (
              <li key={req}>
                <Check size={16} className="rusty-install__check" /> {req}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
