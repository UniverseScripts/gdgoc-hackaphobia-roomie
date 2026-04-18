import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authenticatedFetch } from '../../lib/api'
import './PersonaTestPage.css'

/* ── Static Data Matrices ── */
const SLEEP_OPTIONS = [
  { value: 'sleep_very_early', label: 'Trước 10h', emoji: '🌙', desc: 'Rất sớm' },
  { value: 'sleep_early',      label: '10h – 11h',  emoji: '😴', desc: 'Sớm' },
  { value: 'sleep_normal',     label: '11h – 12h',  emoji: '🕛', desc: 'Bình thường' },
  { value: 'sleep_late',       label: '12h – 1h',   emoji: '🦉', desc: 'Trễ' },
  { value: 'sleep_very_late',  label: 'Sau 1h',     emoji: '🌃', desc: 'Rất trễ' },
]

const CLEANLINESS_OPTIONS = [
  { value: 'clean_messy',          label: 'Rất bừa bộn', emoji: '🌪️', desc: 'Phòng như chiến trường' },
  { value: 'clean_somewhat_messy', label: 'Hơi bừa',     emoji: '😅', desc: 'Bừa nhưng biết chỗ' },
  { value: 'clean_normal',         label: 'Bình thường', emoji: '🤷', desc: 'Không quá chú ý' },
  { value: 'clean_somewhat_clean', label: 'Khá sạch',    emoji: '✨', desc: 'Thích gọn gàng' },
  { value: 'clean_very_clean',     label: 'Rất sạch sẽ', emoji: '🧹', desc: 'Sạch là hạnh phúc' },
]

const NOISE_TOLERANCE_OPTIONS = [
  { value: 'noise_silent',   label: 'Im lặng tuyệt đối', emoji: '🤫', desc: 'Cần yên tĩnh hoàn toàn' },
  { value: 'noise_moderate', label: 'Giảm âm lượng',     emoji: '🔉', desc: 'Sẵn sàng thoả hiệp' },
  { value: 'noise_high',     label: 'Khó thích nghi',    emoji: '😤', desc: 'Tiếng ồn gây khó chịu' },
  { value: 'noise_any',      label: 'Không quan tâm',    emoji: '🎵', desc: 'Ồn cỡ nào cũng được' },
]

const GUEST_FREQUENCY_OPTIONS = [
  { value: 'guest_hate',   label: 'Không bao giờ', emoji: '🚫', desc: 'Không thích khách vào nhà' },
  { value: 'guest_hardly', label: 'Hiếm khi',      emoji: '📅', desc: 'Chỉ dịp đặc biệt' },
  { value: 'guest_notify', label: 'Báo trước',     emoji: '📣', desc: 'OK nếu được thông báo' },
  { value: 'guest_open',   label: 'Thoải mái',     emoji: '🤝', desc: 'Nhà ai cũng đến được' },
]

const PRIORITY_OPTIONS = [
  { value: 'priority_cheap',       label: 'Giá rẻ',          emoji: '💰', desc: 'Tiết kiệm là số 1' },
  { value: 'priority_location',    label: 'Gần trường/làm',  emoji: '📍', desc: 'Đi lại thuận tiện' },
  { value: 'priority_convenience', label: 'Tiện lợi',         emoji: '🛁', desc: 'Đầy đủ tiện nghi' },
  { value: 'priority_security',    label: 'An ninh',          emoji: '🔒', desc: 'An toàn là ưu tiên' },
  { value: 'priority_peaceful',    label: 'Yên tĩnh',         emoji: '🌿', desc: 'Không gian bình yên' },
]

const DISTRICT_OPTIONS = [
  { value: 'District 1',  label: 'Quận 1',    emoji: '🏙️' },
  { value: 'District 3',  label: 'Quận 3',    emoji: '🏛️' },
  { value: 'District 4',  label: 'Quận 4',    emoji: '🌉' },
  { value: 'District 5',  label: 'Quận 5',    emoji: '🏮' },
  { value: 'District 7',  label: 'Quận 7',    emoji: '🏢' },
  { value: 'Binh Thanh',  label: 'Bình Thạnh', emoji: '🌳' },
  { value: 'Thu Duc',     label: 'Thủ Đức',   emoji: '🎓' },
]

const BUDGET_MIN  = 0
const BUDGET_MAX  = 10_000_000
const BUDGET_STEP = 100_000

const formatVND = (v: number) =>
  new Intl.NumberFormat('vi-VN').format(v) + ' đ'

/* ── Step-card option ── */
function OptionCard({
  emoji, label, desc, selected, onClick,
}: {
  emoji: string; label: string; desc?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" className={`pt-option-card ${selected ? 'pt-option-card--selected' : ''}`} onClick={onClick}>
      <span className="pt-option-card__emoji">{emoji}</span>
      <span className="pt-option-card__label">{label}</span>
      {desc && <span className="pt-option-card__desc">{desc}</span>}
      {selected && (
        <span className="pt-option-card__check">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  )
}

/* ── District pill ── */
function DistrictPill({
  emoji, label, selected, onClick,
}: {
  emoji: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" className={`pt-district-pill ${selected ? 'pt-district-pill--selected' : ''}`} onClick={onClick}>
      <span>{emoji}</span> {label}
    </button>
  )
}

/* ── Step configuration ── */
interface StepConfig {
  key: string
  icon: string
  question: string
  subtitle: string
}

const STEPS: StepConfig[] = [
  { key: 'district',       icon: '📍', question: 'Bạn muốn ở khu vực nào?',            subtitle: 'Chọn quận/khu vực bạn muốn tìm phòng.' },
  { key: 'budget',         icon: '💸', question: 'Ngân sách hàng tháng của bạn?',       subtitle: 'Kéo thanh trượt để chọn khoảng giá phù hợp.' },
  { key: 'priority',       icon: '⭐', question: 'Điều gì quan trọng nhất với bạn?',    subtitle: 'Chọn yếu tố ưu tiên hàng đầu khi thuê phòng.' },
  { key: 'sleep',          icon: '🌙', question: 'Bạn thường ngủ lúc mấy giờ?',        subtitle: 'Giờ ngủ ảnh hưởng lớn đến sự tương thích với bạn cùng phòng.' },
  { key: 'cleanliness',    icon: '🧹', question: 'Bạn tự đánh giá độ gọn gàng ra sao?', subtitle: 'Trung thực nhé — không có câu trả lời đúng hay sai!' },
  { key: 'noiseTolerance', icon: '🔊', question: 'Bạn chịu tiếng ồn như thế nào?',     subtitle: 'Ảnh hưởng đến việc chọn bạn cùng phòng và môi trường sống.' },
  { key: 'guestFrequency', icon: '🚪', question: 'Bạn có hay dẫn khách về nhà không?', subtitle: 'Tần suất bạn mời khách để AI tính độ phù hợp.' },
]

export default function PersonaTestPage() {
  const navigate = useNavigate()

  /* ── State vectors (names preserved for API payload) ── */
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

  /* ── Wizard state ── */
  const [currentStep, setCurrentStep] = useState(0)
  const [direction,   setDirection]   = useState<'forward' | 'back'>('forward')
  const [animating,   setAnimating]   = useState(false)

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

  const getStepValue = (key: string) => {
    switch (key) {
      case 'sleep':          return sleep
      case 'cleanliness':    return cleanliness
      case 'noiseTolerance': return noiseTolerance
      case 'guestFrequency': return guestFrequency
      case 'priority':       return priority
      case 'district':       return district
      case 'budget':         return budgetMin > 0 || budgetMax < BUDGET_MAX ? 'set' : ''
      default:               return ''
    }
  }

  const isCurrentStepComplete = () => getStepValue(STEPS[currentStep].key) !== ''

  const goTo = (next: number, dir: 'forward' | 'back') => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrentStep(next)
      setAnimating(false)
    }, 260)
  }

  const handleNext = () => {
    if (!isCurrentStepComplete()) {
      setError('Vui lòng chọn một phương án trước khi tiếp tục.')
      return
    }
    setError(null)
    if (currentStep < STEPS.length - 1) {
      goTo(currentStep + 1, 'forward')
    }
  }

  const handleBack = () => {
    setError(null)
    if (currentStep > 0) goTo(currentStep - 1, 'back')
  }

  const handleSubmit = async () => {
    const allFilled = sleep && cleanliness && noiseTolerance && guestFrequency && priority && district
    if (!allFilled) {
      setError('Dữ liệu không hoàn chỉnh. Vui lòng hoàn thành tất cả các bước.')
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
      <div className="pt-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted, #888)', fontSize: '1rem' }}>Đang kiểm tra trạng thái...</p>
      </div>
    )
  }

  const step = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100
  const isLast = currentStep === STEPS.length - 1

  return (
    <div className="pt-shell">

      {/* ══ Header ══ */}
      <header className="pt-header">
        <div className="pt-header__inner">
          <Link to="/" className="ob-header__logo" aria-label="RooMie Home">
            <img src="/Logo.png" alt="RooMie" />
          </Link>
          <div className="ob-header__step">
            <span className="ob-header__step-num">BƯỚC {currentStep + 1} / {STEPS.length}</span>
            <span className="ob-header__step-desc">Bài trắc nghiệm lối sống</span>
          </div>
        </div>
        <div className="pt-progress-track" role="progressbar" aria-valuenow={progress}>
          <div className="pt-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {/* Dot indicators */}
        <div className="pt-dots">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={`pt-dot ${i === currentStep ? 'pt-dot--active' : ''} ${getStepValue(s.key) ? 'pt-dot--done' : ''}`}
            />
          ))}
        </div>
      </header>

      {/* ══ Step Body ══ */}
      <main className="pt-main">
        <div className={`pt-card pt-card--${direction} ${animating ? 'pt-card--exit' : 'pt-card--enter'}`}>

          {/* Question */}
          <div className="pt-question-block">
            <span className="pt-step-emoji">{step.icon}</span>
            <h1 className="pt-question">{step.question}</h1>
            <p className="pt-question-sub">{step.subtitle}</p>
          </div>

          {/* ── District ── */}
          {step.key === 'district' && (
            <div className="pt-district-grid">
              {DISTRICT_OPTIONS.map(opt => (
                <DistrictPill
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={district === opt.value}
                  onClick={() => { setDistrict(opt.value); setError(null) }}
                />
              ))}
            </div>
          )}

          {/* ── Budget ── */}
          {step.key === 'budget' && (
            <div className="pt-budget-block">
              <div className="pt-budget-display">
                <div className="pt-budget-val">
                  <span className="pt-budget-label">Tối thiểu</span>
                  <strong>{formatVND(budgetMin)}</strong>
                </div>
                <div className="pt-budget-divider">→</div>
                <div className="pt-budget-val">
                  <span className="pt-budget-label">Tối đa</span>
                  <strong>{formatVND(budgetMax)}</strong>
                </div>
              </div>

              {/* ── Dual-handle slider ── */}
              <div
                className="pt-dual-slider"
                style={{
                  background: `linear-gradient(
                    to right,
                    #e5e7eb 0%,
                    #e5e7eb ${(budgetMin / BUDGET_MAX) * 100}%,
                    var(--color-brand) ${(budgetMin / BUDGET_MAX) * 100}%,
                    var(--color-brand) ${(budgetMax / BUDGET_MAX) * 100}%,
                    #e5e7eb ${(budgetMax / BUDGET_MAX) * 100}%,
                    #e5e7eb 100%
                  )`,
                }}
              >
                {/* Min thumb */}
                <input
                  className="pt-dual-slider__input"
                  type="range"
                  min={BUDGET_MIN} max={BUDGET_MAX} step={BUDGET_STEP}
                  value={budgetMin}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v <= budgetMax - BUDGET_STEP) setBudgetMin(v)
                  }}
                />
                {/* Max thumb */}
                <input
                  className="pt-dual-slider__input"
                  type="range"
                  min={BUDGET_MIN} max={BUDGET_MAX} step={BUDGET_STEP}
                  value={budgetMax}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v >= budgetMin + BUDGET_STEP) setBudgetMax(v)
                  }}
                />
              </div>

              <div className="ob-slider__range">
                <span>{formatVND(BUDGET_MIN)}</span>
                <span>{formatVND(BUDGET_MAX)}</span>
              </div>
            </div>
          )}

          {/* ── Sleep ── */}
          {step.key === 'sleep' && (
            <div className="pt-options-grid">
              {SLEEP_OPTIONS.map(opt => (
                <OptionCard key={opt.value} emoji={opt.emoji} label={opt.label} desc={opt.desc}
                  selected={sleep === opt.value}
                  onClick={() => { setSleep(opt.value); setError(null) }}
                />
              ))}
            </div>
          )}

          {/* ── Cleanliness ── */}
          {step.key === 'cleanliness' && (
            <div className="pt-options-grid">
              {CLEANLINESS_OPTIONS.map(opt => (
                <OptionCard key={opt.value} emoji={opt.emoji} label={opt.label} desc={opt.desc}
                  selected={cleanliness === opt.value}
                  onClick={() => { setCleanliness(opt.value); setError(null) }}
                />
              ))}
            </div>
          )}

          {/* ── Noise Tolerance ── */}
          {step.key === 'noiseTolerance' && (
            <div className="pt-options-grid pt-options-grid--2col">
              {NOISE_TOLERANCE_OPTIONS.map(opt => (
                <OptionCard key={opt.value} emoji={opt.emoji} label={opt.label} desc={opt.desc}
                  selected={noiseTolerance === opt.value}
                  onClick={() => { setNoiseTolerance(opt.value); setError(null) }}
                />
              ))}
            </div>
          )}

          {/* ── Guest Frequency ── */}
          {step.key === 'guestFrequency' && (
            <div className="pt-options-grid pt-options-grid--2col">
              {GUEST_FREQUENCY_OPTIONS.map(opt => (
                <OptionCard key={opt.value} emoji={opt.emoji} label={opt.label} desc={opt.desc}
                  selected={guestFrequency === opt.value}
                  onClick={() => { setGuestFrequency(opt.value); setError(null) }}
                />
              ))}
            </div>
          )}

          {/* ── Priority ── */}
          {step.key === 'priority' && (
            <div className="pt-options-grid">
              {PRIORITY_OPTIONS.map(opt => (
                <OptionCard key={opt.value} emoji={opt.emoji} label={opt.label} desc={opt.desc}
                  selected={priority === opt.value}
                  onClick={() => { setPriority(opt.value); setError(null) }}
                />
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="pt-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="pt-nav">
            {currentStep > 0 ? (
              <button type="button" className="pt-nav__back" onClick={handleBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Quay lại
              </button>
            ) : <span />}

            {isLast ? (
              <button
                type="button"
                id="pt-submit-btn"
                className="pt-nav__next pt-nav__next--submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="pt-spinner" /> Đang tính toán...</>
                ) : (
                  <>Hoàn tất <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></>
                )}
              </button>
            ) : (
              <button type="button" className="pt-nav__next" onClick={handleNext}>
                Tiếp theo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
