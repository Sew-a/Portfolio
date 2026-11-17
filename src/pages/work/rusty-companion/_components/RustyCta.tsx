import { FaGithub } from "react-icons/fa";
import { RUSTY_CTA } from "@/src/pages/work/rusty-companion/constants";

export default function RustyCta({ repo }: { repo: string }) {
  return (
    <section className="rusty-cta">
      <p className="rusty-cta__title">{RUSTY_CTA.title}</p>
      <a href={repo} target="_blank" rel="noreferrer" className="rusty-hero__btn rusty-hero__btn--primary">
        <FaGithub size={18} /> {RUSTY_CTA.button}
      </a>
      <p className="rusty-cta__note">{RUSTY_CTA.disclaimer}</p>
    </section>
  );
}
