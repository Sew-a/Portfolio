import { Link } from "react-router-dom";
import { ACTION_BUTTON_TYPE } from "../types";
import "./styles.scss";

type ButtonProps = {
  title?: string;
  onClick?: () => void;
  link?: string;
  buttonType: ACTION_BUTTON_TYPE;
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function ActionButton({
  title,
  onClick,
  link,
  buttonType,
  children,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const content = children || title;
  const classes = `action-button action-button--${buttonType} ${className}`;

  if (link) {
    if (/^(#|mailto:|https?:)/.test(link)) {
      return (
        <a href={link} className={classes}>
          {content}
        </a>
      );
    }

    return (
      <Link to={link} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} type={type} disabled={disabled}>
      {content}
    </button>
  );
}
