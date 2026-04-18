import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../lib/firebase'
import { updateProfile } from 'firebase/auth'
import { authenticatedFetch } from '../../lib/api'
import './SettingsPage.css'

/* ── Small reusable section wrapper ── */
function SettingsSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="sp-section">
      <div className="sp-section__head">
        <span className="sp-section__icon">{icon}</span>
        <h2 className="sp-section__title">{title}</h2>
      </div>
      <div className="sp-section__body">{children}</div>
    </section>
  )
}

/* ── Field row ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sp-field">
      <label className="sp-field__label">{label}</label>
      <div className="sp-field__control">{children}</div>
    </div>
  )
}

const GENDER_MAP: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
}

const PERSONA_LABEL: Record<string, string> = {
  sleep_very_early: 'Rất sớm (Trước 10h)',
  sleep_early:      'Sớm (10h–11h)',
  sleep_normal:     'Bình thường (11h–12h)',
  sleep_late:       'Trễ (12h–1h)',
  sleep_very_late:  'Rất trễ (Sau 1h)',
  clean_messy:          'Rất bừa bộn',
  clean_somewhat_messy: 'Hơi bừa bộn',
  clean_normal:         'Bình thường',
  clean_somewhat_clean: 'Khá sạch sẽ',
  clean_very_clean:     'Rất sạch sẽ',
  noise_silent:   'Hoàn toàn yên tĩnh',
  noise_moderate: 'Sẵn sàng giảm âm lượng',
  noise_high:     'Khó thích nghi',
  noise_any:      'Không quan tâm',
  guest_hate:   'Không bao giờ',
  guest_hardly: 'Hiếm khi',
  guest_notify: 'Chỉ khi báo trước',
  guest_open:   'Thoải mái',
  priority_cheap:       'Giá rẻ',
  priority_location:    'Gần trường/làm',
  priority_convenience: 'Tiện lợi',
  priority_security:    'An ninh',
  priority_peaceful:    'Yên tĩnh',
}

export default function SettingsPage() {
  const { user, userProfile, logout, refetchProfile } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── Local edit state ── */
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [phone,       setPhone]       = useState((userProfile as any)?.phone || '')
  const [bio,         setBio]         = useState(userProfile?.bio || '')

  const [savingInfo,   setSavingInfo]   = useState(false)
  const [infoSuccess,  setInfoSuccess]  = useState(false)
  const [infoError,    setInfoError]    = useState<string | null>(null)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError,     setAvatarError]     = useState<string | null>(null)

  const [resettingTest, setResettingTest] = useState(false)
  const [resetError,    setResetError]    = useState<string | null>(null)
  const [resetSuccess,  setResetSuccess]  = useState(false)

  /* ── Avatar preview ── */
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file || !auth.currentUser) return
    setUploadingAvatar(true)
    setAvatarError(null)
    try {
      // Upload to backend or Firebase Storage; for now update Firebase Auth display photo
      const formData = new FormData()
      formData.append('file', file)
      const data = await authenticatedFetch('/api/media/avatar', {
        method: 'POST',
        body: formData,
      })
      await updateProfile(auth.currentUser, { photoURL: data.url })
      await refetchProfile()
      setAvatarPreview(null)
    } catch (err: any) {
      setAvatarError(err.message || 'Không thể tải ảnh lên.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveInfo = async () => {
    setSavingInfo(true)
    setInfoError(null)
    setInfoSuccess(false)
    try {
      if (auth.currentUser && displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName })
      }
      await authenticatedFetch('/api/onboarding/profile', {
        method: 'POST',
        body: JSON.stringify({
          username:  userProfile?.username || displayName,
          full_name: displayName,
          age:       userProfile?.age,
          gender:    userProfile?.gender,
          role:      userProfile?.role || 'customer',
          bio,
          phone,
        }),
      })
      await refetchProfile()
      setInfoSuccess(true)
      setTimeout(() => setInfoSuccess(false), 3000)
    } catch (err: any) {
      setInfoError(err.message || 'Lỗi lưu thông tin.')
    } finally {
      setSavingInfo(false)
    }
  }

  const handleResetPersonaTest = async () => {
    if (!confirm('Bạn có chắc muốn làm lại bài trắc nghiệm không? Kết quả cũ sẽ bị xoá.')) return
    setResettingTest(true)
    setResetError(null)
    try {
      await authenticatedFetch('/api/test/reset', { method: 'POST' })
      setResetSuccess(true)
      setTimeout(() => navigate('/persona-test'), 1200)
    } catch (err: any) {
      setResetError(err.message || 'Không thể reset. Thử lại sau.')
    } finally {
      setResettingTest(false)
    }
  }

  const currentAvatar = avatarPreview || user?.photoURL || null
  const initials = (user?.displayName || 'R').charAt(0).toUpperCase()

  // Persona data from userProfile (if backend stores it there)
  const persona = (userProfile as any)

  return (
    <div className="sp-shell">

      {/* ══ Header ══ */}
      <header className="sp-topbar">
        <div className="sp-topbar__inner">
          <Link to="/" className="sp-topbar__back" aria-label="Về trang chủ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Quay lại
          </Link>
          <h1 className="sp-topbar__title">Cài đặt tài khoản</h1>
          <span />
        </div>
      </header>

      <main className="sp-main">
        <div className="sp-layout">

          {/* ── Left: Avatar hero ── */}
          <aside className="sp-sidebar">
            <div className="sp-avatar-card">
              <div className="sp-avatar-frame">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="sp-avatar-img" />
                ) : (
                  <div className="sp-avatar-placeholder">{initials}</div>
                )}
                <button
                  className="sp-avatar-edit-btn"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Đổi ảnh đại diện"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="sp-hidden" onChange={handleAvatarPick} />
              <p className="sp-avatar-name">{user?.displayName || 'User'}</p>
              <p className="sp-avatar-email">{user?.email}</p>
              <span className="sp-role-badge">
                {userProfile?.role === 'landlord' ? '🏠 Chủ nhà' : '🧑‍🎓 Cư dân'}
              </span>

              {avatarPreview && (
                <div className="sp-avatar-actions">
                  {avatarError && <p className="sp-error-sm">{avatarError}</p>}
                  <button className="sp-btn sp-btn--primary" onClick={handleAvatarUpload} disabled={uploadingAvatar}>
                    {uploadingAvatar ? 'Đang tải...' : 'Lưu ảnh mới'}
                  </button>
                  <button className="sp-btn sp-btn--ghost" onClick={() => { setAvatarPreview(null); setAvatarError(null) }}>
                    Huỷ
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* ── Right: Sections ── */}
          <div className="sp-content">

            {/* ── Personal Info ── */}
            <SettingsSection icon="👤" title="Thông tin cá nhân">
              <div className="sp-fields-grid">
                <Field label="Họ và tên">
                  <input
                    className="sp-input"
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </Field>
                <Field label="Email">
                  <input className="sp-input sp-input--readonly" type="email" value={user?.email || ''} readOnly />
                </Field>
                <Field label="Số điện thoại">
                  <input
                    className="sp-input"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0901 234 567"
                  />
                </Field>
                <Field label="Giới tính">
                  <input
                    className="sp-input sp-input--readonly"
                    type="text"
                    value={GENDER_MAP[userProfile?.gender || ''] || '—'}
                    readOnly
                  />
                </Field>
                <Field label="Tuổi">
                  <input className="sp-input sp-input--readonly" type="text" value={userProfile?.age ?? '—'} readOnly />
                </Field>
                <Field label={userProfile?.role === 'landlord' ? 'Mã kinh doanh' : 'Trường / Nơi công tác'}>
                  <input
                    className="sp-input sp-input--readonly"
                    type="text"
                    value={userProfile?.role === 'landlord' ? (userProfile?.business_id || '—') : (userProfile?.university || '—')}
                    readOnly
                  />
                </Field>
              </div>
              <Field label="Giới thiệu bản thân">
                <textarea
                  className="sp-textarea"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Một vài dòng về bản thân bạn..."
                  rows={3}
                />
              </Field>
              {infoError && <p className="sp-error">{infoError}</p>}
              <div className="sp-section-footer">
                {infoSuccess && <span className="sp-success">✓ Đã lưu thành công</span>}
                <button className="sp-btn sp-btn--primary" onClick={handleSaveInfo} disabled={savingInfo}>
                  {savingInfo ? (
                    <><span className="sp-spinner" /> Đang lưu...</>
                  ) : 'Lưu thay đổi'}
                </button>
              </div>
            </SettingsSection>

            {/* ── Persona Test ── */}
            <SettingsSection icon="🧠" title="Kết quả trắc nghiệm lối sống">
              {persona?.sleep_schedule ? (
                <>
                  <div className="sp-persona-grid">
                    <div className="sp-persona-item">
                      <span className="sp-persona-item__icon">🌙</span>
                      <div>
                        <p className="sp-persona-item__key">Giờ ngủ</p>
                        <p className="sp-persona-item__val">{PERSONA_LABEL[persona.sleep_schedule] || persona.sleep_schedule}</p>
                      </div>
                    </div>
                    <div className="sp-persona-item">
                      <span className="sp-persona-item__icon">🧹</span>
                      <div>
                        <p className="sp-persona-item__key">Gọn gàng</p>
                        <p className="sp-persona-item__val">{PERSONA_LABEL[persona.cleanliness] || persona.cleanliness}</p>
                      </div>
                    </div>
                    <div className="sp-persona-item">
                      <span className="sp-persona-item__icon">🔊</span>
                      <div>
                        <p className="sp-persona-item__key">Khả năng chịu ồn</p>
                        <p className="sp-persona-item__val">{PERSONA_LABEL[persona.noise_tolerance] || persona.noise_tolerance}</p>
                      </div>
                    </div>
                    <div className="sp-persona-item">
                      <span className="sp-persona-item__icon">🚪</span>
                      <div>
                        <p className="sp-persona-item__key">Tần suất có khách</p>
                        <p className="sp-persona-item__val">{PERSONA_LABEL[persona.guest_frequency] || persona.guest_frequency}</p>
                      </div>
                    </div>
                    <div className="sp-persona-item">
                      <span className="sp-persona-item__icon">⭐</span>
                      <div>
                        <p className="sp-persona-item__key">Ưu tiên</p>
                        <p className="sp-persona-item__val">{PERSONA_LABEL[persona.priority] || persona.priority}</p>
                      </div>
                    </div>
                    <div className="sp-persona-item">
                      <span className="sp-persona-item__icon">📍</span>
                      <div>
                        <p className="sp-persona-item__key">Khu vực</p>
                        <p className="sp-persona-item__val">{persona.district || '—'}</p>
                      </div>
                    </div>
                    {persona.budget && (
                      <div className="sp-persona-item">
                        <span className="sp-persona-item__icon">💸</span>
                        <div>
                          <p className="sp-persona-item__key">Ngân sách</p>
                          <p className="sp-persona-item__val">{persona.budget.replace('-', ' – ')} đ</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="sp-persona-reset">
                    {resetError && <p className="sp-error">{resetError}</p>}
                    {resetSuccess && <p className="sp-success">✓ Đang chuyển đến bài test...</p>}
                    <button
                      className="sp-btn sp-btn--outline-danger"
                      onClick={handleResetPersonaTest}
                      disabled={resettingTest}
                    >
                      {resettingTest ? <><span className="sp-spinner" /> Đang xử lý...</> : '🔄  Làm lại bài trắc nghiệm'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="sp-persona-empty">
                  <span className="sp-persona-empty__emoji">📝</span>
                  <p>Bạn chưa hoàn thành bài trắc nghiệm lối sống.</p>
                  <p className="sp-persona-empty__sub">Hoàn thành để RooMie ghép đôi bạn với người phòng phù hợp nhất!</p>
                  <Link to="/persona-test" className="sp-btn sp-btn--primary sp-btn--inline">
                    Bắt đầu ngay
                  </Link>
                </div>
              )}
            </SettingsSection>

            {/* ── Danger zone ── */}
            <SettingsSection icon="⚙️" title="Tài khoản">
              <div className="sp-account-actions">
                <button
                  className="sp-btn sp-btn--ghost sp-btn--danger"
                  onClick={async () => { await logout(); navigate('/') }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Đăng xuất
                </button>
              </div>
            </SettingsSection>

          </div>
        </div>
      </main>
    </div>
  )
}
