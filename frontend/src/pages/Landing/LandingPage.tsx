import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authenticatedFetch } from '../../lib/api'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import './LandingPage.css'
import logoExtended from '../../assets/logo_extended_stroke.png'

/* ── Data ── */
const FEATURED_AREAS = [
  {
    id: 1,
    name: 'Khu vực Làng Đại Học Thủ Đức',
    count: '340+',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Quận 10 – Gần ĐH Bách Khoa',
    count: '125+',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Quận Bình Thạnh – ĐH HUTECH, UEF',
    count: '210+',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=700&auto=format&fit=crop',
  },
]

type SearchMode = 'room' | 'roommate'

const LandingPage = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>('room')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [verifiedListings, setVerifiedListings] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const data = await authenticatedFetch('/api/listings/recommendations')
        setVerifiedListings((data || []).slice(0, 4))
      } catch (err) {
        console.error("Failed to fetch genesis market data:", err)
      }
    }
    fetchMarket()
  }, [])

  const handleSearch = () => {
    const searchPayload = {
      location_adm2: location || undefined,
      max_budget: budget ? parseFloat(budget.replace(/\D/g, '')) : undefined
    }
    navigate('/listings', { state: { query: searchPayload } })
  }

  return (
    <div className="landing">
      <Header />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero" aria-label="Hero section">
        <div className="hero__overlay" />
        <div className="hero__content">
          <img src={logoExtended} alt="Khoảng trời riêng của sinh viên" className="hero__logo-extended" />

          {/* Search Widget */}
          <div className="search-widget" role="search">
            {/* Tabs */}
            <div className="search-widget__tabs">
              <button
                id="tab-room"
                className={`search-widget__tab ${searchMode === 'room' ? 'search-widget__tab--active' : ''}`}
                onClick={() => setSearchMode('room')}
                aria-pressed={searchMode === 'room'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Tìm Phòng
              </button>
              <button
                id="tab-roommate"
                className={`search-widget__tab ${searchMode === 'roommate' ? 'search-widget__tab--active' : ''}`}
                onClick={() => setSearchMode('roommate')}
                aria-pressed={searchMode === 'roommate'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Tìm Roommate
              </button>
            </div>

            {/* Inputs Row */}
            <div className="search-widget__row">
              <div className="search-widget__field">
                <svg className="search-widget__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div className="search-widget__field-text">
                  <label htmlFor="search-location" className="search-widget__field-label">
                    ĐỊA ĐIỂM / TRƯỜNG ĐẠI HỌC
                  </label>
                  <input
                    id="search-location"
                    type="text"
                    className="search-widget__field-input"
                    placeholder="VD: Đại học Bách Khoa..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-widget__divider" aria-hidden="true" />

              <div className="search-widget__field">
                <svg className="search-widget__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <div className="search-widget__field-text">
                  <label htmlFor="search-budget" className="search-widget__field-label">
                    NGÂN SÁCH (VNĐ/THÁNG)
                  </label>
                  <input
                    id="search-budget"
                    type="text"
                    className="search-widget__field-input"
                    placeholder="Chọn khoảng giá..."
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
              </div>

              <button id="search-btn" className="search-widget__btn" onClick={handleSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Tìm Kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED AREAS ═══════════════ */}
      <section className="section featured-areas" aria-label="Featured areas">
        <div className="container">
          <h2 className="section__title">Khu vực nổi bật quanh trường</h2>
          <div className="area-grid">
            {FEATURED_AREAS.map((area) => (
              <article key={area.id} className="area-card">
                <img
                  src={area.image}
                  alt={area.name}
                  className="area-card__img"
                  loading="lazy"
                />
                <div className="area-card__gradient" />
                <div className="area-card__content">
                  <p className="area-card__name">{area.name}</p>
                  <p className="area-card__count">{area.count} phòng</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ VERIFIED LISTINGS ═══════════════ */}
      <section className="section verified-section" aria-label="Verified listings">
        <div className="container">
          <div className="verified-panel">
            <div className="verified-panel__header">
              <div>
                <h2 className="section__title">Phòng trọ sinh viên đã xác minh</h2>
                <p className="section__subtitle">Chất lượng đảm bảo, thông tin minh bạch</p>
              </div>
              <Link to="/listings" className="see-all-link" id="see-all-listings-link">
                Xem tất cả →
              </Link>
            </div>

            <div className="listing-grid">
              {verifiedListings.map((item) => (
                <article key={item.id} className="listing-card">
                  <div className="listing-card__img-wrap">
                    <img
                      src={item.images?.[0] || 'https://via.placeholder.com/400x300'}
                      alt={item.title}
                      className="listing-card__img"
                      loading="lazy"
                    />
                    <span className="listing-card__badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Xác minh
                    </span>
                  </div>
                  <div className="listing-card__body">
                    <p className="listing-card__price">
                      {new Intl.NumberFormat('vi-VN').format(item.price)} đ<span>/tháng</span>
                    </p>
                    <p className="listing-card__title">{item.title}</p>
                    <p className="listing-card__location">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {item.district}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
