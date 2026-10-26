import ResumePage from "@/src/components/Resume/Resume";
import Seo from "@/src/components/Seo";
import "../../styles.scss";

export default function Resume() {
  return (
    <div className="pages-spacing">
      <Seo
        title="Résumé — Sevak Avetisyan"
        description="Senior Frontend Engineer résumé: 5+ years with React, TypeScript and micro-frontends at Picsart. Open to remote roles in EMEA or worldwide."
      />
      <ResumePage />
    </div>
  );
}
