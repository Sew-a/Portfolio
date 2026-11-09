import { HeadingText, ActionButton } from "@/src/components/UI";
import { ACTION_BUTTON_TYPE } from "@/src/components/types";
import { paths } from "@/src/routes/mainRoutes";
import { PROJECT_NOT_FOUND } from "@/src/pages/work/_components/ProjectDetail/constants";

export default function MissingProject() {
  return (
    <section className="project-detail project-detail--missing">
      <HeadingText title={PROJECT_NOT_FOUND.title} label={PROJECT_NOT_FOUND.label} />
      <ActionButton
        title={PROJECT_NOT_FOUND.backAction}
        link={paths.work}
        buttonType={ACTION_BUTTON_TYPE.GHOST}
      />
    </section>
  );
}