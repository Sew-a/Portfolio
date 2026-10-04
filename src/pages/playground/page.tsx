import PlaygroundPage from "@/src/components/Playground/Playground";
import Seo from "@/src/components/Seo";

export default function Playground() {
  return (
    <>
      <Seo
        title="Playground — Sevak Avetisyan"
        description="Playground: a product search UI built with TanStack Query and debounced filtering."
      />
      <PlaygroundPage />
    </>
  );
}
