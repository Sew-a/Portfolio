import { ACTION_NAMES, type ImageItemProps } from "@/src/store/types";
import "./styles.scss";
import ActionButton from "../UI/ActionButton";
import { ACTION_BUTTON_TYPE } from "../types";
import useScrollReveal from "@/src/hooks/useScrollReveal";

const imageActions = [
  ACTION_NAMES.OPEN,
  ACTION_NAMES.RENAME,
  ACTION_NAMES.DOWNLOAD,
  ACTION_NAMES.DELETE,
];

export default function ImageItem({
  id,
  url,
  type,
  name,
  handleClick,
}: ImageItemProps) {
  const { ref, isVisible } = useScrollReveal({
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
    once: false,
  });

  return (
    <div ref={ref} className="image-container">
      <div className="image-holder">
        {isVisible ? (
          <img
            src={url}
            alt={name}
            width={300}
            height={220}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder" aria-label="loading image" />
        )}
      </div>
      <div className="info-holder">
        <p>{name}</p>
        <p>{type}</p>
      </div>
      <div className="actions-list">
        {imageActions.map((action) => (
          <ActionButton
            key={crypto.randomUUID()}
            title={action}
            onClick={() => handleClick(action, id, url)}
            buttonType={ACTION_BUTTON_TYPE.ACTION}
          />
        ))}
      </div>
    </div>
  );
}
