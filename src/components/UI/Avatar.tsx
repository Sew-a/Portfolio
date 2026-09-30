import "./Avatar.scss";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md";
}

/** User avatar image, falling back to the first letter of the name. */
const Avatar: React.FC<AvatarProps> = ({ name, src, size = "md" }) => (
  <span className={`avatar avatar--${size}`} aria-hidden="true">
    {src ? (
      <img src={src} alt="" className="avatar__img" />
    ) : (
      name.charAt(0).toUpperCase()
    )}
  </span>
);

export default Avatar;
