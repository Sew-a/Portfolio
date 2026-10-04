import Seo from "@/src/components/Seo";
import DemosExperience from "./components/DemosExperience/DemosExperience";
import { DEMOS_SEO } from "./constants";
import "./styles.scss";

export default function DemosPage() {
  return (
    <main className="demos-page">
      <Seo title={DEMOS_SEO.title} description={DEMOS_SEO.description} />
      <DemosExperience />
      
    </main>
  );
}