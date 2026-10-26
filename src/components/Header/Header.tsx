import { Link } from "react-router-dom";
import { useAppStore } from "@/src/store/useAppStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { paths } from "@/src/routes/mainRoutes";
import { UserMenu } from "@/src/components/Auth";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useHeaderState } from "./useHeaderState";
import { headerRoutes, HEADER_BRAND, isActiveRoute } from "./constants";
import "./styles.scss";

export default function Header() {
  const { pathname, isOpen, isScrolled, toggleMenu } = useHeaderState();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isSignedIn = useAuthStore((s) => !!s.user);
  // Only the chat needs an account; elsewhere "Sign in" makes the whole site look gated.
  const showUserMenu = isSignedIn || pathname.startsWith(paths.chat);

  return (
    <header
      className={`header ${isScrolled ? "header--scrolled" : ""} ${isOpen ? "header--menu-open" : ""}`}
    >
      <div className="header__inner">
        <div className="header__logo">{HEADER_BRAND}</div>
        <nav className={`header__nav ${isOpen ? "header__nav--open" : ""}`}>
          {headerRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={`header__nav-link ${isActiveRoute(pathname, route.path) ? "active" : ""}`}
            >
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="header__controls">
          <button
            className="header__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span className="header__theme-icon">
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </span>
          </button>
          {showUserMenu && <UserMenu />}
        </div>

        <div className="header__mobile-auth">
          {showUserMenu && <UserMenu />}
        </div>

        <button
          className="header__menu-btn"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}