import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authenticatedFetch } from '../../lib/api'
import '../Onboarding/OnboardingPage.css'

/* ── Static Data Matrices ── */
const SLEEP_OPTIONS = [
  { value: 'sleep_very_early', label: 'Rất sớm (Trước 10h)' },
  { value: 'sleep_early',      label: 'Sớm (10h-11h)' },
  { value: 'sleep_normal',     label: 'Bình thường (11h-12h)' },
  { value: 'sleep_late',       label: 'Trễ (12h-1h)' },
  { value: 'sleep_very_late',  label: 'Rất trễ (Sau 1h)' },
]

const CLEANLINESS_OPTIONS = [
  { value: 'clean_messy',          label: 'Rất bừa bộn' },
  { value: 'clean_somewhat_messy', label: 'Hơi bừa bộn' },
  { value: 'clean_normal',         label: 'Bình thường' },
  { value: 'clean_somewhat_clean', label: 'Khá sạch sẽ' },
  { value: 'clean_very_clean',     label: 'Rất sạch sẽ' },
]

const NOISE_TOLERANCE_OPTIONS = [
  { value: 'noise_silent',   label: 'Hoàn toàn yên tĩnh' },
  { value: 'noise_moderate', label: 'Sẵn sàng giảm âm lượng' },
  { value: 'noise_high',     label: 'Khó thích nghi' },
  { value: 'noise_any',      label: 'Không quan tâm tiếng ồn' },
]

const GUEST_FREQUENCY_OPTIONS = [
  { value: 'guest_hate',   label: 'Không bao giờ' },
  { value: 'guest_hardly', label: 'Hiếm khi' },
  { value: 'guest_notify', label: 'Chỉ khi báo trước' },
  { value: 'guest_open',   label: 'Thoải mái' },
]

const PRIORITY_OPTIONS = [
  { value: 'priority_cheap',        label: 'Giá rẻ' },
  { value: 'priority_location',     label: 'Gần trường/chỗ làm' },
  { value: 'priority_convenience',  label: 'Tiện lợi' },
  { value: 'priority_security',     label: 'An ninh' },
  { value: 'priority_peaceful',     label: 'Yên tĩnh' },
]

const DISTRICT_OPTIONS = [
  { value: 'District 1',  label: 'Quận 1' },
  { value: 'District 3',  label: 'Quận 3' },
  { value: 'District 4',  label: 'Quận 4' },
  { value: 'District 5',  label: 'Quận 5' },
  { value: 'District 7',  label: 'Quận 7' },
  { value: 'Binh Thanh', label: 'Bình Thạnh' },
  { value: 'Thu Duc',    label: 'Thủ Đức' },
]

const BUDGET_MIN  = 0
const BUDGET_MAX  = 10_000_000
const BUDGET_STEP = 100_000

const formatVND = (v: number) =>
  new Intl.NumberFormat('vi-VN').format(v) + ' đ'

/* ── Reusable pill group ── */
function PillGroup({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[]
  selected: string
  onSelect: (v: string) => void
}) {
  return (
    <div className="ob-options-grid">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`ob-pill ${selected === opt.value ? 'ob-pill--active-yellow' : ''}`}
          onClick={() => onSelect(opt.value)}
        >
          {selected === opt.value && (
            <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function PersonaTestPage() {
  const navigate = useNavigate()

  /* ── State vectors ── */
  const [sleep,          setSleep]          = useState('')
  const [cleanliness,    setCleanliness]    = useState('')
  const [noiseTolerance, setNoiseTolerance] = useState('')
  const [guestFrequency, setGuestFrequency] = useState('')
  const [priority,       setPriority]       = useState('')
  const [district,       setDistrict]       = useState('')
  const [budgetMin,      setBudgetMin]      = useState(1_500_000)
  const [budgetMax,      setBudgetMax]      = useState(4_000_000)
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [error,          setError]          = useState<string | null>(null)
  const [statusLoading,  setStatusLoading]  = useState(true)

  /* ── Status Check: Redirect if test already completed ── */
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await authenticatedFetch('/api/test/status')
        if (data.completed) {
          navigate('/matches', { replace: true })
        }
      } catch {
        // Let the form render if the check fails
      } finally {
        setStatusLoading(false)
      }
    }
    checkStatus()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sleep || !cleanliness || !noiseTolerance || !guestFrequency || !priority || !district) {
      setError('Dữ liệu không hoàn chỉnh. Cần chọn tất cả các trường.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await authenticatedFetch('/api/test/submit', {
        method: 'POST',
        body: JSON.stringify({
          sleep_schedule:  sleep,
          cleanliness:     cleanliness,
          noise_tolerance: noiseTolerance,
          guest_frequency: guestFrequency,
          priority:        priority,
          district:        district,
          budget:          `${budgetMin}-${budgetMax}`,
        }),
      })
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Infrastructure Failure: Vertex AI normalization rejected the payload.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (statusLoading) {
    return (
      <div className="onboarding" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--color-text-muted, #888)', fontSize: '1rem' }}>Đang kiểm tra trạng thái...</p>
      </div>
    )
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
            <span className="ob-header__step-num">BƯỚC 2 CỦA 2</span>
            <span className="ob-header__step-desc">Bài trắc nghiệm lối sống</span>
          </div>
        </div>
        {/* Progress bar — step 2 of 2 = 100% */}
        <div className="ob-progress" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
          <div className="ob-progress__fill" style={{ width: '100%' }} />
        </div>
      </header>

      {/* ══ Main Form Card ══ */}
      <main className="ob-main">
        <form className="ob-card" onSubmit={handleSubmit} noValidate>
          <h1 className="ob-card__title">Bài trắc nghiệm phong cách sống</h1>
          <p className="ob-card__subtitle">
            Thuật toán AI sẽ dựa vào đây để tính toán độ tương thích của bạn với bạn cùng phòng và không gian sống.
          </p>

          {/* ── Khu vực ── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <h2>Khu vực ưu tiên</h2>
            </div>
            <PillGroup options={DISTRICT_OPTIONS} selected={district} onSelect={setDistrict} />
          </div>

          {/* ── Ngân sách ── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </span>
              <h2>Ngân sách hàng tháng (VNĐ)</h2>
            </div>
            <div className="ob-budget">
              <div className="ob-budget__header">
                <span className="ob-budget__value">{formatVND(budgetMin)}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>—</span>
                <span className="ob-budget__value">{formatVND(budgetMax)}</span>
              </div>
              <input
                className="ob-slider"
                type="range" min={BUDGET_MIN} max={BUDGET_MAX} step={BUDGET_STEP}
                value={budgetMin}
                style={{ background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${(budgetMin / BUDGET_MAX) * 100}%, #e5e7eb ${(budgetMin / BUDGET_MAX) * 100}%, #e5e7eb 100%)` }}
                onChange={e => { const v = Number(e.target.value); if (v <= budgetMax) setBudgetMin(v) }}
              />
              <input
                className="ob-slider"
                type="range" min={BUDGET_MIN} max={BUDGET_MAX} step={BUDGET_STEP}
                value={budgetMax}
                style={{ background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${(budgetMax / BUDGET_MAX) * 100}%, #e5e7eb ${(budgetMax / BUDGET_MAX) * 100}%, #e5e7eb 100%)` }}
                onChange={e => { const v = Number(e.target.value); if (v >= budgetMin) setBudgetMax(v) }}
              />
              <div className="ob-slider__range">
                <span>{formatVND(BUDGET_MIN)}</span>
                <span>{formatVND(BUDGET_MAX)}</span>
              </div>
            </div>
          </div>

          {/* ── Ưu tiên ── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </span>
              <h2>Yếu tố quan trọng nhất</h2>
            </div>
            <PillGroup options={PRIORITY_OPTIONS} selected={priority} onSelect={setPriority} />
          </div>

          {/* ── Lịch sinh hoạt ── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
              <h2>Lịch sinh hoạt</h2>
            </div>
            <PillGroup options={SLEEP_OPTIONS} selected={sleep} onSelect={setSleep} />
          </div>

          {/* ── Gọn gàng ── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                </svg>
              </span>
              <h2>Mức độ gọn gàng</h2>
            </div>
            <PillGroup options={CLEANLINESS_OPTIONS} selected={cleanliness} onSelect={setCleanliness} />
          </div>

          {/* ── Tiếng ồn ── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              </span>
              <h2>Khả năng chịu ồn</h2>
            </div>
            <PillGroup options={NOISE_TOLERANCE_OPTIONS} selected={noiseTolerance} onSelect={setNoiseTolerance} />
          </div>

          {/* ── Khách ── */}
          <div className="ob-section">
            <div className="ob-section__title">
              <span className="ob-section__icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <h2>Tần suất dẫn khách về nhà</h2>
            </div>
            <PillGroup options={GUEST_FREQUENCY_OPTIONS} selected={guestFrequency} onSelect={setGuestFrequency} />
          </div>

          {/* ── Error barrier ── */}
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>
              <strong>SYSTEM ERROR:</strong> {error}
            </div>
          )}

          {/* ── CTA ── */}
          <button type="submit" id="pt-submit-btn" className="ob-submit" disabled={isSubmitting}>
            {isSubmitting ? 'ĐANG TÍNH TOÁN VECTOR...' : 'Hoàn tất trắc nghiệm'}
            {!isSubmitting && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
