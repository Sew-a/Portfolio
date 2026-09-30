import { useAppStore } from "@/src/store/useAppStore";
import { Sun, Moon } from "lucide-react";
import "./ThemeSwitcher.scss";

const VersionSwitcher = () => {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <div className="version-switcher-container">
      <div className="theme-switcher">
        <button
          className="theme-switcher__toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span className="theme-switcher__icon">
            {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
          </span>
          <span className="theme-switcher__track">
            <span className="theme-switcher__thumb" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default VersionSwitcher;
