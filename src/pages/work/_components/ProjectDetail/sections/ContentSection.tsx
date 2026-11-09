import { HeadingText } from "@/src/components/UI";
import type { ContentSectionProps } from "@/src/pages/work/_components/ProjectDetail/types";

export default function ContentSection({
  heading,
  className,
  children,
}: ContentSectionProps) {
  return (
    <div className={className}>
      <HeadingText title={heading.title} label={heading.label} />
      {children}
    </div>
  );
}