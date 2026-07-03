import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "./AccountMenu.css";

const DEFAULT_AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#888"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
  );

function AccountMenu() {
  const { user, loginInProgress, googleLogin, logout } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!panelOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen]);

  const handleLogout = async () => {
    setPanelOpen(false);
    await logout();
  };

  if (!user) {
    return (
      <div className="accountMenu">
        <button
          type="button"
          className="accountLoginButton"
          onClick={googleLogin}
          disabled={loginInProgress}
        >
          {loginInProgress ? "ログイン中..." : "ログイン"}
        </button>
      </div>
    );
  }

  const avatarSrc = user.photoURL || DEFAULT_AVATAR;

  return (
    <div className="accountMenu" ref={containerRef}>
      <button
        type="button"
        className="accountIconButton"
        onClick={() => setPanelOpen((open) => !open)}
        aria-label="アカウントメニュー"
      >
        <img src={avatarSrc} alt="" className="accountUserIcon" />
      </button>

      {panelOpen && (
        <div className="accountPanel">
          <div className="accountPanelHeader">
            <img src={avatarSrc} alt="" className="accountPanelAvatar" />
            <div className="accountPanelName">{user.displayName || "ユーザー"}</div>
            <div className="accountPanelEmail">{user.email || ""}</div>
          </div>
          <button type="button" className="accountPanelLogout" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
