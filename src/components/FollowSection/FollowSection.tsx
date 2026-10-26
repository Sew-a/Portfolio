import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_DATA, RESUME } from "@/src/data/portfolioData";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";
import "./styles.scss";

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const CONTACT_LINKS = [
  {
    label: "Email",
    value: HERO_DATA.email,
    href: `mailto:${HERO_DATA.email}`,
    external: false,
    Icon: EmailIcon,
  },
  {
    label: "LinkedIn",
    value: HERO_DATA.linkedin.replace(/^https:\/\/www\./, "").replace(/\/$/, ""),
    href: HERO_DATA.linkedin,
    external: true,
    Icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    value: RESUME.github.replace(/^https:\/\//, ""),
    href: RESUME.github,
    external: true,
    Icon: GitHubIcon,
  },
];

/** Fixed right-hand rail. Hover (or click/tap the title) opens a panel with the contact links. */
const FollowSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);

  useEscapeKey(close);

  // Touch devices get no mouseleave, so close on a tap outside.
  useEffect(() => {
    if (!isOpen) return;
    const handleDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", handleDown);
    return () => document.removeEventListener("pointerdown", handleDown);
  }, [isOpen, close]);

  return (
    <aside className="follow-section" aria-label="Contact links">
      <div
        ref={rootRef}
        className={`follow-section__inner ${isOpen ? "follow-section__inner--open" : ""}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={close}
      >
        <button
          className="follow-section__title"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="contact-panel"
        >
          Contact me
        </button>
        {CONTACT_LINKS.map(({ label, href, external, Icon }) => (
          <a
            key={label}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="follow-link"
            title={label}
          >
            <Icon />
          </a>
        ))}
        <div className="follow-section__line"></div>

        <div id="contact-panel" className="contact-panel">
          <span className="contact-panel__title">Get in touch</span>
          <ul className="contact-panel__list">
            {CONTACT_LINKS.map(({ label, value, href, external, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="contact-panel__link"
                >
                  <span className="contact-panel__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="contact-panel__text">
                    <span className="contact-panel__label">{label}</span>
                    <span className="contact-panel__value">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default FollowSection;
