import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__body">
        <div className="footer__brand">
          <div className="footer__logo-wrap">
            <img src="/Logo.png" alt="RooMie" />
          </div>
          <p className="footer__tagline">
            Nền tảng tìm kiếm phòng trọ và ghép đôi roommate an toàn, đáng tin cậy dành cho sinh viên.
          </p>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Về RooMie</h4>
          <ul className="footer__links">
            <li><Link to="/about">Giới thiệu</Link></li>
            <li><Link to="/terms">Quy chế hoạt động</Link></li>
            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Hỗ trợ</h4>
          <ul className="footer__links">
            <li><Link to="/help">Trung tâm trợ giúp</Link></li>
            <li><Link to="/report">Báo cáo vi phạm</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Theo dõi chúng tôi</h4>
          <div className="footer__socials">
            <a href="https://facebook.com" className="footer__social" aria-label="Facebook" target="_blank" rel="noopener noreferrer">FB</a>
            <a href="https://instagram.com" className="footer__social" aria-label="Instagram" target="_blank" rel="noopener noreferrer">IG</a>
            <a href="https://tiktok.com" className="footer__social" aria-label="TikTok" target="_blank" rel="noopener noreferrer">TT</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© 2026 RooMie. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
