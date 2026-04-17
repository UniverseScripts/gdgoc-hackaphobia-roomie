import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authenticatedFetch } from '../../lib/api'
import './PersonaTestPage.css'
/* ── Static Data Matrices ── */
const SLEEP_OPTIONS = [
  { value: 'sleep_very_early', label: 'Rất sớm (Trước 10h)' },
  { value: 'sleep_early', label: 'Sớm (10h-11h)' },
  { value: 'sleep_normal', label: 'Bình thường (11h-12h)' },
  { value: 'sleep_late', label: 'Trễ (12h-1h)' },
  { value: 'sleep_very_late', label: 'Rất trễ (Sau 1h)' }
]

const CLEANLINESS_OPTIONS = [
  { value: 'clean_messy', label: 'Rất bừa bộn' },
  { value: 'clean_somewhat_messy', label: 'Hơi bừa bộn' },
  { value: 'clean_normal', label: 'Bình thường' },
  { value: 'clean_somewhat_clean', label: 'Khá sạch sẽ' },
  { value: 'clean_very_clean', label: 'Rất sạch sẽ' }
]

const NOISE_TOLERANCE_OPTIONS = [
  { value: 'noise_silent', label: 'Hoàn toàn yên tĩnh' },
  { value: 'noise_moderate', label: 'Sẵn sàng giảm âm lượng' },
  { value: 'noise_high', label: 'Khó thích nghi' },
  { value: 'noise_any', label: 'Không quan tâm tiếng ồn' }
]

const GUEST_FREQUENCY_OPTIONS = [
  { value: 'guest_hate', label: 'Không bao giờ' },
  { value: 'guest_hardly', label: 'Hiếm khi' },
  { value: 'guest_notify', label: 'Chỉ khi báo trước' },
  { value: 'guest_open', label: 'Thoải mái' }
]

const PRIORITY_OPTIONS = [
  { value: 'priority_cheap', label: 'Giá rẻ' },
  { value: 'priority_location', label: 'Gần trường/chỗ làm' },
  { value: 'priority_convenience', label: 'Tiện lợi' },
  { value: 'priority_security', label: 'An ninh' },
  { value: 'priority_peaceful', label: 'Yên tĩnh' }
]

const DISTRICT_OPTIONS = [
  { value: 'District 1', label: 'Quận 1' },
  { value: 'District 3', label: 'Quận 3' },
  { value: 'District 4', label: 'Quận 4' },
  { value: 'District 5', label: 'Quận 5' },
  { value: 'District 7', label: 'Quận 7' },
  { value: 'Binh Thanh', label: 'Bình Thạnh' },
  { value: 'Thu Duc',    label: 'Thủ Đức' },
]

const BUDGET_MIN = 0
const BUDGET_MAX = 10_000_000
const BUDGET_STEP = 100_000

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + ' đ'

export default function PersonaTestPage() {
  const navigate = useNavigate()

  /* ── State: Schema Vectors ── */
  const [sleep, setSleep] = useState('')
  const [cleanliness, setCleanliness] = useState('')
  const [noiseTolerance, setNoiseTolerance] = useState('')
  const [guestFrequency, setGuestFrequency] = useState('')
  const [priority, setPriority] = useState('')
  const [district, setDistrict] = useState('')

  /* ── State: Budget Hooks ── */
  const [budgetMin, setBudgetMin] = useState(1_500_000)
  const [budgetMax, setBudgetMax] = useState(4_000_000)

  /* ── State: Execution ── */
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sleep || !cleanliness || !noiseTolerance || !guestFrequency || !priority || !district) {
      setError("Dữ liệu không hoàn chỉnh. Cần chọn tất cả các trường.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await authenticatedFetch('/api/test/submit', {
        method: 'POST',
        body: JSON.stringify({
          sleep_schedule: sleep,
          cleanliness: cleanliness,
          noise_tolerance: noiseTolerance,
          guest_frequency: guestFrequency,
          priority: priority,
          district: district,
          budget: String(`${budgetMin}-${budgetMax}`) // Cast to string per backend requirement
        })
      })

      navigate('/')

    } catch (err: any) {
      setError(err.message || 'Infrastructure Failure: Vertex AI normalization rejected the payload.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="ob-layout">
      <header className="ob-header">
        <div className="ob-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Roomie
        </div>
        <div className="ob-steps">
          <div className="ob-step">
            <span className="ob-step-num">1</span>
            <span className="ob-step-label">Hồ sơ</span>
          </div>
          <div className="ob-step ob-step--active">
            <span className="ob-step-num">2</span>
            <span className="ob-step-label">Lối sống</span>
          </div>
        </div>
      </header>

      <main className="ob-main">
        <div className="ob-content-wrapper">
          <div className="ob-hero">
            <h1 className="ob-title">Bài trắc nghiệm phong cách sống</h1>
            <p className="ob-subtitle">Thuật toán AI sẽ dựa vào đây để tính toán độ tương thích của bạn với bạn cùng phòng và không gian sống.</p>
          </div>

          <form onSubmit={handleSubmit} className="ob-form">
            
            {/* ── District ── */}
            <div className="ob-section">
              <div className="ob-section-header">
                <h2 className="ob-section-title">Khu vực ưu tiên</h2>
              </div>
              <div className="ob-options-grid">
                {DISTRICT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ob-pill ${district === opt.value ? 'ob-pill--active-yellow' : ''}`}
                    onClick={() => setDistrict(opt.value)}
                  >
                    {district === opt.value && (
                      <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Budget Slider ── */}
            <div className="ob-section">
              <div className="ob-section-header">
                <h2 className="ob-section-title">Ngân sách hàng tháng (VNĐ)</h2>
              </div>
              <div className="budget-display">
                <span>{formatVND(budgetMin)}</span>
                <span>-</span>
                <span>{formatVND(budgetMax)}</span>
              </div>
              <div className="budget-sliders">
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={budgetMin}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val <= budgetMax) setBudgetMin(val)
                  }}
                />
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={budgetMax}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= budgetMin) setBudgetMax(val)
                  }}
                />
              </div>
            </div>

            {/* ── Priority ── */}
            <div className="ob-section">
              <div className="ob-section-header">
                <h2 className="ob-section-title">Yếu tố quan trọng nhất</h2>
              </div>
              <div className="ob-options-grid">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ob-pill ${priority === opt.value ? 'ob-pill--active-yellow' : ''}`}
                    onClick={() => setPriority(opt.value)}
                  >
                    {priority === opt.value && (
                      <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Sleep ── */}
            <div className="ob-section">
              <div className="ob-section-header">
                <h2 className="ob-section-title">Lịch sinh hoạt</h2>
              </div>
              <div className="ob-options-grid">
                {SLEEP_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ob-pill ${sleep === opt.value ? 'ob-pill--active-yellow' : ''}`}
                    onClick={() => setSleep(opt.value)}
                  >
                    {sleep === opt.value && (
                      <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Cleanliness ── */}
            <div className="ob-section">
              <div className="ob-section-header">
                <h2 className="ob-section-title">Mức độ gọn gàng</h2>
              </div>
              <div className="ob-options-grid">
                {CLEANLINESS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ob-pill ${cleanliness === opt.value ? 'ob-pill--active-yellow' : ''}`}
                    onClick={() => setCleanliness(opt.value)}
                  >
                    {cleanliness === opt.value && (
                      <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    <div className="ob-pill__content">
                      <span className="ob-pill__label">{opt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Noise Tolerance ── */}
            <div className="ob-section">
              <div className="ob-section-header">
                <h2 className="ob-section-title">Khả năng chịu ồn</h2>
              </div>
              <div className="ob-options-grid">
                {NOISE_TOLERANCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ob-pill ${noiseTolerance === opt.value ? 'ob-pill--active-yellow' : ''}`}
                    onClick={() => setNoiseTolerance(opt.value)}
                  >
                    {noiseTolerance === opt.value && (
                      <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Guest Frequency ── */}
            <div className="ob-section">
              <div className="ob-section-header">
                <h2 className="ob-section-title">Tần suất dẫn bạn về nhà</h2>
              </div>
              <div className="ob-options-grid">
                {GUEST_FREQUENCY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ob-pill ${guestFrequency === opt.value ? 'ob-pill--active-yellow' : ''}`}
                    onClick={() => setGuestFrequency(opt.value)}
                  >
                    {guestFrequency === opt.value && (
                      <svg className="ob-pill__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Error Barrier ── */}
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>
                <strong>SYSTEM ERROR:</strong> {error}
              </div>
            )}

            {/* ── Execution CTA ── */}
            <button type="submit" id="ob-submit-btn" className="ob-submit" disabled={isSubmitting}>
              {isSubmitting ? 'ĐANG TÍNH TOÁN VECTOR...' : 'Hoàn tất trắc nghiệm'}
              {!isSubmitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
            </button>

          </form>
        </div>
      </main>
    </div>
  )
}
