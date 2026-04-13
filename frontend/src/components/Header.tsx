import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="header">
      <div className="header__inner">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <img src="/Logo_Extended.png" alt="RooMie" />
        </Link>

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
          <Link to="/login" className="header__btn header__btn--ghost" id="header-login-btn">
            Đăng nhập
          </Link>
          <Link to="/signup" className="header__btn header__btn--filled" id="header-signup-btn">
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
