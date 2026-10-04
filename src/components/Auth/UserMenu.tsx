import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, Settings } from "lucide-react";
import Avatar from "@/src/components/UI/Avatar";
import { useAuth } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/store/useAuthStore";

/** Header control: "Sign in" button when signed out, avatar + menu when signed in. */
const UserMenu: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const openSettings = useAuthStore((s) => s.openSettings);
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  if (!user) {
    return (
      <button className="user-menu__signin" onClick={() => openAuthModal("signin")}>
        <LogIn size={14} />
        Sign in
      </button>
    );
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Account menu for ${user.username}`}
      >
        <Avatar name={user.username} src={user.avatarUrl} size="sm" />
      </button>

      {isOpen && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__info">
            <strong>{user.username}</strong>
            <span>{user.email}</span>
          </div>
          <button
            role="menuitem"
            className="user-menu__item"
            onClick={() => {
              setIsOpen(false);
              openSettings();
            }}
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            role="menuitem"
            className="user-menu__item"
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
