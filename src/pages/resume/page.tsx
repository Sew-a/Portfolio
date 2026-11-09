import ResumePage from "@/src/components/Resume/Resume";
import Seo from "@/src/components/Seo";
import "@/src/styles/sections.scss";

export default function Resume() {
  return (
    <div className="pages-spacing">
      <Seo
        title="Résumé — Sevak Avetisyan"
        description="Senior Frontend Engineer résumé: 6 years with React, TypeScript and micro-frontends at Picsart. Open to remote roles in EMEA or worldwide."
      />
      <ResumePage />
    </div>
  );
}
