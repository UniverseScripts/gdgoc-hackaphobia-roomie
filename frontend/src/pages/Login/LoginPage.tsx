import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LoginPage.css'

const LoginPage = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isSignup, setIsSignup] = useState(false) // Toggle between Login/Signup
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { loginWithGoogle, loginWithFacebook, loginWithEmail, signupWithEmail } = useAuth()

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      navigate('/onboarding')
    } catch (error) {
      console.error(error)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook()
      navigate('/onboarding')
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      if (isSignup) {
        await signupWithEmail(email, password)
      } else {
        await loginWithEmail(email, password)
      }
      // Firebase Identity established. Route to Profile Matrix.
      navigate('/onboarding')
    } catch (err: any) {
      setError(err.message || "Authentication failed.")
    }
  }

  return (
    <div className="login-page">
      {/* ══ LEFT — Atmospheric Image ══ */}
      <div className="login-page__left" aria-hidden="true">
        <div className="login-page__left-overlay" />
        <div className="login-page__left-content">
          <h2 className="login-page__left-title">
            Tìm kiếm không gian sống lý tưởng của bạn
          </h2>
          <p className="login-page__left-sub">
            Hàng ngàn phòng trọ xác minh và roommate phù hợp đang chờ đón bạn.
          </p>
        </div>
      </div>

      {/* ══ RIGHT — Form Panel ══ */}
      <main className="login-page__right">
        <div className="login-form-wrap">
          {/* Logo */}
          <div className="login-logo">
            <img src="/Logo.png" alt="RooMie Logo" />
          </div>

          <h1 className="login-title">{isSignup ? 'Tạo tài khoản RooMie' : 'Chào mừng trở lại RooMie!'}</h1>
          <p className="login-subtitle">{isSignup ? 'Đăng ký để tiếp tục' : 'Vui lòng đăng nhập để tiếp tục tìm kiếm'}</p>

          {error && <div className="login-error-message" style={{ color: '#d32f2f', background: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">
                Email hoặc Số điện thoại
              </label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-field-header">
                <label className="login-label" htmlFor="login-password">Mật khẩu</label>
                <Link to="/forgot-password" className="login-forgot" id="forgot-password-link">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" id="login-submit-btn" className="btn-login">
              {isSignup ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider" aria-label="or">
            <span>Hoặc {isSignup ? 'đăng ký' : 'đăng nhập'} với</span>
          </div>

          {/* Social Buttons */}
          <div className="login-socials">
            <button id="google-login-btn" className="btn-social" type="button" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button id="facebook-login-btn" className="btn-social" type="button" onClick={handleFacebookLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <p className="login-register-cta">
            {isSignup ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
            <button 
              type="button" 
              onClick={() => { setIsSignup(!isSignup); setError(null); }} 
              className="login-register-link" 
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }} 
              id="signup-link"
            >
              {isSignup ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
