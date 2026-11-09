import { HeadingText } from "@/src/components/UI";
import { useWindowSize } from "@/src/hooks/useWindowSize";
import { useImagePopup } from "@/src/hooks/useImagePopup";
import type { GalleryImage } from "@/src/utils/gallery";
import { useMasonryColumns } from "./useMasonryColumns";
import GridItem from "./GridItem";
import { GRID_HEADING } from "./constants";
import "./styles.scss";

interface GridProps {
  images: GalleryImage[];
}

export default function Grid({ images }: GridProps) {
  const { width } = useWindowSize();
  const { openPopup, PopupPreview } = useImagePopup();
  const { columns, columnsCount } = useMasonryColumns(images, width);

  return (
    <>
      <div className="grid-wrapper">
        <HeadingText title={GRID_HEADING.title} label={GRID_HEADING.label} />
        <div
          className="masonry-grid"
          style={{ "--col-count": columnsCount } as React.CSSProperties}
        >
          {columns.map((col, i) => (
            <div key={i} className="masonry-column">
              {col.map((item) => (
                <GridItem key={item.id} item={item} onOpen={openPopup} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <PopupPreview />
    </>
  );
}