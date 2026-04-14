import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

const Header = () => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="header">
      <div className="header__inner">
        {/* Brand & Greeting */}
        <div className="header__brand">
          <Link to="/" className="header__logo">
            <img src="/Logo_Extended.png" alt="RooMie" />
          </Link>
          {user && (
            <span className="header__user-greeting">
              Chào mừng trở lại, <strong>{user.displayName}</strong>
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="header__nav" aria-label="Main navigation">
          <Link
            to="/listings"
            className={`header__nav-link ${isActive('/listings') ? 'header__nav-link--active' : ''}`}
          >
            Tìm Phòng
          </Link>
          <Link
            to="/matches"
            className={`header__nav-link ${isActive('/matches') ? 'header__nav-link--active' : ''}`}
          >
            Ghép Đôi
          </Link>
          <Link
            to="/blog"
            className={`header__nav-link ${isActive('/blog') ? 'header__nav-link--active' : ''}`}
          >
            Blog
          </Link>
        </nav>

        {/* Auth Actions */}
        <div className="header__actions">
          {user ? (
            <div className="header__user">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="header__user-avatar" />
              ) : (
                <div className="header__user-avatar-placeholder">{(user.displayName || 'R').charAt(0).toUpperCase()}</div>
              )}
              <button className="header__btn header__btn--ghost btn-logout" onClick={logout} aria-label="Đăng xuất">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="header__btn header__btn--ghost" id="header-login-btn">
                Đăng nhập
              </Link>
              <Link to="/signup" className="header__btn header__btn--filled" id="header-signup-btn">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
