import Header from '../../components/Header'
import './ListingsPage.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import L from 'leaflet'
import { authenticatedFetch } from '../../lib/api'
import 'leaflet/dist/leaflet.css'

// --- Kiểu dữ liệu ---
import type { Apartment } from '../../types'

function toCompactPriceLabel(price: number): string {
  if (!price) return '0 đ';
  const inMillions = price / 1_000_000;
  const compact = Number.isInteger(inMillions) ? String(inMillions) : inMillions.toFixed(1);
  return `${compact}Tr`;
}

// ─── PROPERTY DETAIL PANEL ───────────────────────────────────────────────────
function PropertyDetailPanel({ listing, onClose }: { listing: Apartment; onClose: () => void }) {
  const [slideIdx, setSlideIdx] = useState(0)

  const prevSlide = () => setSlideIdx(i => (i - 1 + listing.images.length) % listing.images.length)
  const nextSlide = () => setSlideIdx(i => (i + 1) % listing.images.length)

  // Mapping vector coordinates array to static map endpoints
  const lat = listing.coordinates?.[0] || 10.772;
  const lng = listing.coordinates?.[1] || 106.664;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <aside className="property-detail-panel">
      {/* ─ Close Button ─ */}
      <button className="detail-close-btn" onClick={onClose} aria-label="Đóng">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      {/* ─ Image Carousel ─ */}
      <div className="detail-carousel">
        <img
          src={listing.images?.[slideIdx] || 'https://via.placeholder.com/800x500'}
          alt={`${listing.title} - ảnh ${slideIdx + 1}`}
          className="detail-carousel__img"
        />
        {listing.images?.length > 1 && (
          <>
            <button className="carousel-btn carousel-btn--prev" onClick={prevSlide}>&#8249;</button>
            <button className="carousel-btn carousel-btn--next" onClick={nextSlide}>&#8250;</button>
            <div className="carousel-dots">
              {listing.images.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot ${i === slideIdx ? 'active' : ''}`}
                  onClick={() => setSlideIdx(i)}
                />
              ))}
            </div>
          </>
        )}
        <span className="detail-type-badge">{listing.housing_type}</span>
      </div>

      {/* ─ Info Content ─ */}
      <div className="detail-content">
        {/* Header Info */}
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{listing.title}</h2>
            <div className="detail-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {listing.district} {listing.address ? `- ${listing.address}` : ''}
            </div>
          </div>
          <div className="detail-rating-box">
            {listing.total_reviews === 0 ? (
              <span className="detail-rating-star">New Property</span>
            ) : (
              <>
                <span className="detail-rating-star">⭐</span>
                <strong>{listing.average_rating}</strong>
                <span className="detail-review-count">({listing.total_reviews} đánh giá)</span>
              </>
            )}
          </div>
        </div>

        {/* Price & Availability */}
        <div className="detail-price-row">
          <div>
            <div className="detail-price">{new Intl.NumberFormat('vi-VN').format(listing.price)} đ <span>/ tháng</span></div>
            <div className="detail-meta-row">
              <span>🏠 {listing.size} m²</span>
            </div>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-maps-link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Xem bản đồ
          </a>
        </div>

        {/* Description */}
        <div className="detail-section">
          <h4 className="detail-section-title">Mô tả</h4>
          <p className="detail-description">{listing.description}</p>
        </div>

          {/* Tags / Features are derived from amenities or omitted based on payload */}

        {/* Amenities */}
        <div className="detail-section">
          <h4 className="detail-section-title">Tiện ích</h4>
          <div className="detail-amenities">
            {listing.amenities?.map(a => (
              <div key={a} className="amenity-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* Coordinates */}
        <div className="detail-section">
          <h4 className="detail-section-title">Toạ độ</h4>
          <div className="detail-coords">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </div>
        </div>

        {/* Landlord Contact */}
        <div className="detail-section detail-landlord">
          <h4 className="detail-section-title">Thông tin chủ nhà</h4>
          <div className="landlord-card">
            {/* Needs dynamic owner profile resolution. Pending API details. */}
            <div>Vui lòng liên hệ trực tiếp chủ nhà qua Chat.</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="detail-cta">
          <button className="btn-cta btn-cta--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Nhắn tin hỏi thuê
          </button>
          <button className="btn-cta btn-cta--ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Lưu yêu thích
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── LISTINGS PAGE ────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null)
  const [selectedListing, setSelectedListing] = useState<Apartment | null>(null)
  const [listings, setListings] = useState<Apartment[]>([])
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const baseQuery = location.state?.query || {}

  useEffect(() => {
    const executeSearch = async () => {
      try {
        const payload = {
          ...baseQuery,
          semantic_query: null // Inheriting default UI null assignment until mapped
        }

        const res = await authenticatedFetch('/api/market/search', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Infrastructure Failure: Market API execution dropped. The NoSQL request failed.')
        const data = await res.json()
        setListings(data.data || [])
      } catch (err: any) {
        setError(err.message)
      }
    }
    executeSearch()
  }, [])
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerGroupRef = useRef<L.LayerGroup | null>(null)
  const markerByIdRef = useRef<Record<string, L.Marker>>({})
  const mapCenter = useMemo<L.LatLngTuple>(() => [10.7769, 106.7009], [])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: 13,
      zoomControl: false
    })

    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const markerLayer = L.layerGroup().addTo(map)
    markerGroupRef.current = markerLayer

    // ── Đánh dấu trường học (University Pinpoint) ──
    const universityPos: L.LatLngTuple = [10.771964, 106.657920]
    const schoolIcon = L.divIcon({
      className: 'school-marker-wrapper',
      html: `
        <div class="school-marker" title="Trường Đại học Bách khoa TP.HCM">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 10-10-5L2 10l10 5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/><path d="M11 22v-5"/>
          </svg>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [-22, -44]
    })

    L.marker(universityPos, { icon: schoolIcon, zIndexOffset: 1000 })
      .bindPopup(`
        <div class="listing-popup">
          <strong style="color: var(--color-primary)">📍 Trường học của bạn</strong>
          <div style="margin-top: 1px; font-weight: 600;">Trường Đại học Bách khoa TP.HCM</div>
        </div>
      `)
      .addTo(markerLayer)

    listings.forEach(item => {
      const priceLabel = toCompactPriceLabel(item.price)
      const priceMarkerIcon = L.divIcon({
        className: 'price-marker-wrapper',
        html: `<div class="price-marker">${priceLabel}</div>`,
        popupAnchor: [-8, -40]
      })

      const lat = item.coordinates?.[0] || 10.772;
      const lng = item.coordinates?.[1] || 106.664;
      const marker = L.marker([lat, lng], { icon: priceMarkerIcon })
        .bindPopup(
          `<div class="listing-popup">
            <strong>${item.title}</strong>
            <div>${item.district}</div>
          </div>`
        )
        .addTo(markerLayer)
      markerByIdRef.current[item.id] = marker
    })

    return () => {
      markerLayer.clearLayers()
      markerByIdRef.current = {}
      map.remove()
      mapRef.current = null
    }
  }, [mapCenter])

  // Khi panel mở/tắt, báo Leaflet re-render tile để tránh vùng xám
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize()
    }, 50) // nhỏ delay để DOM đã update kích thước
    return () => clearTimeout(timer)
  }, [selectedListing])

  // Highlight marker khi hover card
  useEffect(() => {
    Object.entries(markerByIdRef.current).forEach(([id, marker]) => {
      const markerElement = marker.getElement()
      if (!markerElement) return
      markerElement.classList.toggle('is-active', hoveredListingId === id)
    })
  }, [hoveredListingId])

  const handleZoomIn = () => {
    const map = mapRef.current
    if (!map) return
    map.setZoom(map.getZoom() + 1)
  }

  const handleZoomOut = () => {
    const map = mapRef.current
    if (!map) return
    map.setZoom(map.getZoom() - 1)
  }

  const handleCardClick = (item: Apartment) => {
    setSelectedListing(prev => prev?.id === item.id ? null : item)
    // Pan map to selected listing
    const lat = item.coordinates?.[0] || 10.772;
    const lng = item.coordinates?.[1] || 106.664;
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 15, { duration: 0.8 })
    }
  }

  if (error) {
    return (
      <div className="listings-layout">
        <Header />
        <main className="listings-main" style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #f87171' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>SYSTEM HALTED</h2>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="listings-layout">
      <Header />
      
      <main className="listings-main">
        {/* === SIDEBAR: SEARCH & LIST === */}
        <aside className="listings-sidebar">
          {/* Search Box */}
          <div className="listings-search-box">
            <div className="search-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input type="text" placeholder="Tìm kiếm khu vực, quận/huyện..." />
            </div>
            
            <div className="filter-tabs">
              {['Tất cả', 'Phòng trọ', 'Chung cư mini', 'Ký túc xá'].map(tab => (
                <button 
                  key={tab}
                  className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Properties List */}
          <div className="properties-list">
            <h2 className="list-title">Gợi ý cho bạn ({listings.length})</h2>
            <div className="properties-grid">
              {listings.map(item => (
                <div
                  key={item.id}
                  className={`property-card ${selectedListing?.id === item.id ? 'property-card--selected' : ''}`}
                  onMouseEnter={() => setHoveredListingId(item.id)}
                  onMouseLeave={() => setHoveredListingId(null)}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="property-img">
                    <img src={item.images?.[0] || 'https://via.placeholder.com/400x300'} alt={item.title} loading="lazy" />
                    <div className="property-rating">
                      {item.total_reviews === 0 ? "New Property" : `⭐ ${item.average_rating}`}
                    </div>
                  </div>
                  <div className="property-info">
                    <div className="property-price">{new Intl.NumberFormat('vi-VN').format(item.price)} đ <span>/ tháng</span></div>
                    <h3 className="property-title">{item.title}</h3>
                    <div className="property-location">📍 {item.district}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* === MAP AREA === */}
        <div className="listings-map-area">
          <div ref={mapContainerRef} className="leaflet-map-canvas" />
          <div className="map-controls">
            <button className="map-ctrl-btn" onClick={handleZoomIn}>+</button>
            <button className="map-ctrl-btn" onClick={handleZoomOut}>-</button>
          </div>
        </div>

        {/* === DETAIL PANEL === */}
        {selectedListing && (
          <PropertyDetailPanel
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )}
      </main>
    </div>
  )
}