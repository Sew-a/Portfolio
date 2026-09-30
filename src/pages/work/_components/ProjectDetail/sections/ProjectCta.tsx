import { ActionButton } from "@/src/components/UI";
import { ACTION_BUTTON_TYPE } from "@/src/components/types";
import { paths } from "@/src/routes/mainRoutes";
import { RESUME } from "@/src/data/portfolioData";
import { PROJECT_CTA } from "../constants";

export default function ProjectCta() {
  return (
    <div className="project-detail__cta">
      <p>{PROJECT_CTA.message}</p>
      <ActionButton
        title={PROJECT_CTA.getInTouch}
        link={`mailto:${RESUME.email}`}
        buttonType={ACTION_BUTTON_TYPE.PRIMARY}
      />
      <ActionButton
        title={PROJECT_CTA.backToWork}
        link={paths.work}
        buttonType={ACTION_BUTTON_TYPE.GHOST}
      />
    </div>
  );
}