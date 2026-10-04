import { Link } from "react-router-dom";

interface LiveLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/** Internal paths ("/chat") navigate in-app; external URLs open in a new tab. */
export default function LiveLink({ href, className, children }: LiveLinkProps) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}
