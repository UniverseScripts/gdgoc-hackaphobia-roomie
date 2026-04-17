import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authenticatedFetch } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './OnboardingPage.css'

/* ── Static Data ── */
const SLEEP_OPTIONS = [
  { value: 'early', label: 'Ngủ sớm (Trước 11h)' },
  { value: 'late',  label: 'Cú đêm (Sau 12h)' },
]

const CLEANLINESS_OPTIONS = [
  { value: 'very_clean', label: 'Rất gọn gàng',  desc: 'Luôn dọn dẹp mỗi ngày' },
  { value: 'normal',     label: 'Bình thường',    desc: 'Dọn dẹp hàng tuần' },
  { value: 'relaxed',    label: 'Thoải mái',      desc: 'Không quá khắt khe' },
]

const PERSONALITY_OPTIONS = [
  { value: 'introverted', label: 'Hướng nội' },
  { value: 'ambivert',    label: 'Hòa đồng' },
  { value: 'extroverted', label: 'Hướng ngoại' },
]

const BUDGET_MIN = 0
const BUDGET_MAX = 10_000_000
const BUDGET_STEP = 100_000

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + ' đ'

const OnboardingPage = () => {
  /* ── State ── */
  const [username,    setUsername]    = useState('')
  const [fullName,    setFullName]    = useState('')
  const [age,         setAge]         = useState('')
  const [university,  setUniversity]  = useState('')
  const [budget,      setBudget]      = useState(2_500_000)
  const [sleep,       setSleep]       = useState('early')
  const [cleanliness, setCleanliness] = useState('very_clean')
  const [personality, setPersonality] = useState('introverted')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const navigate = useNavigate()
  const { userProfile } = useAuth()

  /* Dynamic slider track fill */
  const budgetPercent = useCallback(
    () => ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100,
    [budget]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Transmit the payload across the secure bridge
      await authenticatedFetch('/api/onboarding/profile', {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          full_name: fullName,
          age: Number(age),
          university: university,
          // Include any test vectors or preferences captured in the form state
          preferences: { budget, sleep, cleanliness, personality }
        })
      });

      // UPON 200 OK: The backend has generated the user record and vectors.
      // Route strictly to the market grid.
      navigate('/landing'); 
    } catch (err: any) {
      setError(err.message || 'Infrastructure Failure: Payload rejected by the gatekeeper.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="onboarding">

      {/* ══ Sticky Top Bar ══ */}
      <header className="ob-header">
        <div className="ob-header__inner">
          <Link to="/" className="ob-header__logo" aria-label="RooMie Home">
            <img src="/Logo.png" alt="RooMie" />
          </Link>
          <div className="ob-header__step">
            <span className="ob-header__step-num">BƯỚC 1 CỦA 3</span>
            <span className="ob-header__step-desc">Hồ Sơ cá nhân &amp; Lối sống</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="ob-progress" role="progressbar" aria-valuenow={33} aria-valuemin={0} aria-valuemax={100}>
          <div className="ob-progress__fill" style={{ width: '33%' }} />
        </div>
      </header>

      {/* ══ Main Form Card ══ */}
      <main className="ob-main">
        <form className="ob-card" onSubmit={handleSubmit} noValidate>
          <h1 className="ob-card__title">Hoàn thiện Hồ sơ của bạn</h1>
          <p className="ob-card__subtitle">
            Giúp RooMie tìm cho bạn những người bạn cùng phòng và căn phòng phù hợp nhất.
          </p>

          {/* ─── SECTION 1: Basic Info ─── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <h2>Thông tin cơ bản</h2>
            </div>
            
            <div className="ob-row">
              <div className="ob-field">
                <label className="ob-label" htmlFor="ob-username">Tên đăng nhập (Username)</label>
                <input
                  id="ob-username"
                  type="text"
                  className="ob-input"
                  placeholder="VD: nguyenvana_99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label" htmlFor="ob-age">Tuổi</label>
                <input
                  id="ob-age"
                  type="number"
                  className="ob-input"
                  placeholder="VD: 20"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <div className="ob-row">
              <div className="ob-field">
                <label className="ob-label" htmlFor="ob-fullname">Họ và Tên</label>
                <input
                  id="ob-fullname"
                  type="text"
                  className="ob-input"
                  placeholder="VD: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="ob-field">
                <label className="ob-label" htmlFor="ob-university">Trường Đại học / Cao đẳng</label>
                <input
                  id="ob-university"
                  type="text"
                  className="ob-input"
                  placeholder="VD: ĐH Bách Khoa TPHCM"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
            </div>

            {/* Budget Slider */}
            <div className="ob-budget">
              <div className="ob-budget__header">
                <label className="ob-label" htmlFor="ob-budget-slider">
                  Ngân sách mong muốn (VNĐ/Tháng)
                </label>
                <span className="ob-budget__value">{formatVND(budget)}</span>
              </div>
              <input
                id="ob-budget-slider"
                type="range"
                className="ob-slider"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right,
                    var(--color-brand) 0%,
                    var(--color-brand) ${budgetPercent()}%,
                    #e5e7eb ${budgetPercent()}%,
                    #e5e7eb 100%)`
                }}
              />
              <div className="ob-slider__range">
                <span>0 đ</span>
                <span>10.000.000 đ</span>
              </div>
            </div>
          </div>

          {/* ─── SECTION 2: Lifestyle ─── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </span>
              <h2>Sở thích &amp; Lối sống</h2>
            </div>

            {/* Sleep schedule */}
            <div className="ob-field">
              <label className="ob-label">Khung giờ ngủ</label>
              <div className="ob-pills" role="group" aria-label="Khung giờ ngủ">
                {SLEEP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`sleep-${opt.value}`}
                    className={`ob-pill ob-pill--dark ${sleep === opt.value ? 'ob-pill--selected' : ''}`}
                    onClick={() => setSleep(opt.value)}
                    aria-pressed={sleep === opt.value}
                  >
                    {sleep === opt.value && (
                      <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cleanliness */}
            <div className="ob-field">
              <label className="ob-label">Mức độ sạch sẽ</label>
              <div className="ob-cards" role="group" aria-label="Mức độ sạch sẽ">
                {CLEANLINESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`clean-${opt.value}`}
                    className={`ob-card-opt ${cleanliness === opt.value ? 'ob-card-opt--selected' : ''}`}
                    onClick={() => setCleanliness(opt.value)}
                    aria-pressed={cleanliness === opt.value}
                  >
                    {cleanliness === opt.value && (
                      <span className="ob-card-opt__badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    )}
                    <span className="ob-card-opt__label">{opt.label}</span>
                    <span className="ob-card-opt__desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personality */}
            <div className="ob-field">
              <label className="ob-label">Tính cách / Giao tiếp</label>
              <div className="ob-pills" role="group" aria-label="Tính cách">
                {PERSONALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`personality-${opt.value}`}
                    className={`ob-pill ob-pill--yellow ${personality === opt.value ? 'ob-pill--active-yellow' : ''}`}
                    onClick={() => setPersonality(opt.value)}
                    aria-pressed={personality === opt.value}
                  >
                    {personality === opt.value && (
                      <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Barrier */}
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>
              <strong>SYSTEM REJECTION:</strong> {error}
            </div>
          )}

          {/* CTA */}
          <button type="submit" id="ob-submit-btn" className="ob-submit" disabled={isSubmitting}>
            {isSubmitting ? 'ĐANG ĐỒNG BỘ DỮ LIỆU...' : 'Lưu hồ sơ & Tiếp tục'}
            {!isSubmitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
          </button>
        </form>
      </main>
    </div>
  )
}

export default OnboardingPage
