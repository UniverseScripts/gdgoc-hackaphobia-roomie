import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authenticatedFetch } from '../../lib/api'
import './OnboardingPage.css'

// Static data for personality tests has been eradicated to match the User schema.

const OnboardingPage = () => {
  /* ── State ── */
  const [role,        setRole]        = useState<'customer' | 'landlord'>('customer')
  const [username,    setUsername]    = useState('')
  const [fullName,    setFullName]    = useState('')
  const [age,         setAge]         = useState('')
  const [gender,      setGender]      = useState('')
  const [university,  setUniversity]  = useState('')
  const [businessId,  setBusinessId]  = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const navigate = useNavigate()



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gender) {
      setError("Vui lòng chọn giới tính.")
      return
    }
    
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Construct the Absolute Base
      const basePayload: any = {
        username: username,
        full_name: fullName,
        age: Number(age),
        gender: gender,
        role: role // Injected explicitly for the backend factory
      };

      // 2. Execute Local Polymorphic Injection
      if (role === 'landlord') {
        basePayload.business_id = businessId;
        basePayload.business_name = fullName; // Fulfilling schema requirement
      } else {
        basePayload.university = university;
      }

      // 3. Transmit
      await authenticatedFetch('/api/onboarding/profile', {
        method: 'POST',
        body: JSON.stringify(basePayload)
      })

      navigate('/listings') 

    } catch (err: any) {
      setError(err.message || 'Infrastructure Failure: Payload rejected by the gatekeeper.')
    } finally {
      setIsSubmitting(false)
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
            <span className="ob-header__step-desc">Hồ Sơ cá nhân</span>
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

          {/* ── Section: Role Declaration ── */}
          <div className="ob-section">
            <div className="ob-section-header">
              <h2 className="ob-section-title" style={{fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)'}}>Trục danh tính (Role)</h2>
            </div>
            <div className="ob-options-grid" style={{display: 'flex', gap: '1rem'}}>
              <button
                type="button"
                className={`ob-pill ${role === 'customer' ? 'ob-pill--active-yellow' : ''}`}
                onClick={() => setRole('customer')}
                style={{flex: 1, justifyContent: 'center'}}
              >
                {role === 'customer' && (
                  <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                Cư dân (Customer)
              </button>
              <button
                type="button"
                className={`ob-pill ${role === 'landlord' ? 'ob-pill--active-yellow' : ''}`}
                onClick={() => setRole('landlord')}
                style={{flex: 1, justifyContent: 'center'}}
              >
                {role === 'landlord' && (
                  <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                Chủ nhà (Landlord)
              </button>
            </div>
          </div>

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
                <label className="ob-label" htmlFor="ob-age">Tuổi & Giới tính</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input
                    id="ob-age"
                    type="number"
                    className="ob-input"
                    placeholder="VD: 20"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{flex: 1}}
                  />
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)} 
                    className="ob-input" 
                    style={{flex: 1, backgroundColor: 'transparent'}}
                  >
                    <option value="" disabled>Giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
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
              
              {/* ── Conditional RBAC Field (Bound to Local State) ── */}
              {role === 'landlord' ? (
                <div className="ob-field">
                  <label className="ob-label" htmlFor="businessId">Mã số kinh doanh (Business ID) *</label>
                  <input 
                    type="text" 
                    id="businessId" 
                    name="businessId" 
                    required 
                    className="ob-input"
                    placeholder="VD: 0312345678" 
                    value={businessId} 
                    onChange={(e) => setBusinessId(e.target.value)} 
                  />
                </div>
              ) : (
                <div className="ob-field">
                  <label className="ob-label" htmlFor="university">Trường Đại học / Nơi công tác *</label>
                  <input 
                    type="text" 
                    id="university" 
                    name="university" 
                    required 
                    className="ob-input"
                    placeholder="VD: Đại học Bách Khoa TP.HCM" 
                    value={university} 
                    onChange={(e) => setUniversity(e.target.value)} 
                  />
                </div>
              )}
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
