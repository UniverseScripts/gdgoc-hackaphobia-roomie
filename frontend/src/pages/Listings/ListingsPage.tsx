import Header from '../../components/Header'
import './ListingsPage.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// --- Kiểu dữ liệu ---
interface Listing {
  id: string
  title: string
  price: string
  area: number
  location: string
  address: string
  rating: number
  reviewCount: number
  tags: string[]
  amenities: string[]
  images: string[]
  lat: number
  lng: number
  landlord: {
    name: string
    avatar: string
    phone: string
    responseRate: string
    online: boolean
  }
  description: string
  available: string
  deposit: string
  type: string
}

// --- Mock Data ---
const MOCK_LISTINGS: Listing[] = [
  {
    id: 'p1',
    title: 'Phòng trọ khép kín gần ĐH Bách Khoa',
    price: '3.500.000 đ',
    area: 22,
    location: 'Quận 10, TP.HCM',
    address: '12/4 Đinh Tiên Hoàng, Phường 1, Quận 10, TP.HCM',
    rating: 4.8,
    reviewCount: 34,
    tags: ['Tự do giờ giấc', 'Toilet riêng'],
    amenities: ['WiFi tốc độ cao', 'Điều hoà', 'Tủ lạnh', 'Máy giặt chung', 'Camera an ninh', 'Chỗ để xe'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800&h=500',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800&h=500',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800&h=500',
    ],
    lat: 10.772225, lng: 106.664640,
    landlord: {
      name: 'Chú Minh Hùng',
      avatar: 'https://i.pravatar.cc/80?img=11',
      phone: '0901 234 567',
      responseRate: '98%',
      online: true
    },
    description: 'Phòng khép kín, thoáng mát, cửa sổ nhìn ra đường. Yên tĩnh, an ninh tốt. Thích hợp cho sinh viên và người đi làm. Gần ĐH Bách Khoa, ĐH Sư Phạm, siêu thị Co.op Mart.',
    available: 'Hiện có',
    deposit: '1 tháng',
    type: 'Phòng trọ'
  },
  {
    id: 'p2',
    title: 'Studio mini full nội thất Quận 3',
    price: '4.200.000 đ',
    area: 30,
    location: 'Quận 3, TP.HCM',
    address: '88 Trần Quốc Thảo, Phường 7, Quận 3, TP.HCM',
    rating: 4.9,
    reviewCount: 61,
    tags: ['Full nội thất', 'Cửa sổ lớn', 'An ninh'],
    amenities: ['WiFi cáp quang', 'Điều hoà', 'Tủ lạnh', 'Máy giặt riêng', 'Bếp từ', 'Ban công'],
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800&h=500',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800&h=500',
      'https://images.unsplash.com/photo-1502672260266-1c1bd280d924?auto=format&fit=crop&q=80&w=800&h=500',
    ],
    lat: 10.7833, lng: 106.6879,
    landlord: {
      name: 'Cô Thu Hương',
      avatar: 'https://i.pravatar.cc/80?img=47',
      phone: '0912 345 678',
      responseRate: '100%',
      online: false
    },
    description: 'Studio cao cấp full nội thất mới, thiết kế hiện đại. Tầng cao view đẹp, khu vực yên tĩnh, phù hợp cặp đôi hoặc người đi làm thu nhập tốt. Gần Landmark 81, Bitexco.',
    available: 'Hiện có',
    deposit: '2 tháng',
    type: 'Chung cư mini'
  },
  {
    id: 'p3',
    title: 'Ký túc xá cao cấp bao điện nước',
    price: '1.800.000 đ',
    area: 12,
    location: 'Quận Tân Bình, TP.HCM',
    address: '73 Trường Chinh, Phường 15, Quận Tân Bình, TP.HCM',
    rating: 4.5,
    reviewCount: 120,
    tags: ['Gần bến xe buýt', 'Bao điện nước'],
    amenities: ['WiFi miễn phí', 'Phòng sinh hoạt chung', 'Giặt ủi dịch vụ', 'Chỗ để xe'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800&h=500',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800&h=500',
    ],
    lat: 10.8018, lng: 106.6595,
    landlord: {
      name: 'Ban Quản Lý KTX',
      avatar: 'https://i.pravatar.cc/80?img=33',
      phone: '028 3812 5678',
      responseRate: '90%',
      online: true
    },
    description: 'Ký túc xá cao cấp dành cho sinh viên và người mới đi làm. Bao gồm điện nước, không gian chung tiện nghi. Khu vực an toàn, bảo vệ 24/7. Gần sân bay Tân Sơn Nhất.',
    available: 'Hiện có',
    deposit: '0 tháng',
    type: 'Ký túc xá'
  },
  {
    id: 'p4',
    title: 'Phòng giá rẻ cho sinh viên',
    price: '2.500.000 đ',
    area: 18,
    location: 'Quận Bình Thạnh, TP.HCM',
    address: '24 Đinh Bộ Lĩnh, Phường 26, Quận Bình Thạnh, TP.HCM',
    rating: 4.2,
    reviewCount: 28,
    tags: ['Không chung chủ'],
    amenities: ['WiFi cơ bản', 'Điều hoà', 'Chỗ để xe máy', 'Cửa vân tay'],
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800&h=500',
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800&h=500',
    ],
    lat: 10.8062, lng: 106.7132,
    landlord: {
      name: 'Anh Quốc Thắng',
      avatar: 'https://i.pravatar.cc/80?img=12',
      phone: '0933 456 789',
      responseRate: '85%',
      online: false
    },
    description: 'Phòng trọ sạch sẽ, không chung chủ, tự do thoải mái. Có gác lửng tiện lợi. Gần Cầu Sài Gòn, trung tâm thương mại Vincom Đồng Khởi chỉ 10 phút xe.',
    available: 'Hiện có',
    deposit: '1 tháng',
    type: 'Phòng trọ'
  }
]

function toCompactPriceLabel(price: string): string {
  const numeric = Number(price.replace(/[^\d]/g, ''))
  if (!numeric) return price
  const inMillions = numeric / 1_000_000
  const compact = Number.isInteger(inMillions) ? String(inMillions) : inMillions.toFixed(1)
  return `${compact}Tr`
}

// ─── PROPERTY DETAIL PANEL ───────────────────────────────────────────────────
function PropertyDetailPanel({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [slideIdx, setSlideIdx] = useState(0)

  const prevSlide = () => setSlideIdx(i => (i - 1 + listing.images.length) % listing.images.length)
  const nextSlide = () => setSlideIdx(i => (i + 1) % listing.images.length)

  const googleMapsUrl = `https://www.google.com/maps?q=${listing.lat},${listing.lng}`

  return (
    <aside className="property-detail-panel">
      {/* ─ Close Button ─ */}
      <button className="detail-close-btn" onClick={onClose} aria-label="Đóng">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      {/* ─ Image Carousel ─ */}
      <div className="detail-carousel">
        <img
          src={listing.images[slideIdx]}
          alt={`${listing.title} - ảnh ${slideIdx + 1}`}
          className="detail-carousel__img"
        />
        {listing.images.length > 1 && (
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
        <span className="detail-type-badge">{listing.type}</span>
      </div>

      {/* ─ Info Content ─ */}
      <div className="detail-content">
        {/* Header Info */}
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{listing.title}</h2>
            <div className="detail-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {listing.address}
            </div>
          </div>
          <div className="detail-rating-box">
            <span className="detail-rating-star">⭐</span>
            <strong>{listing.rating}</strong>
            <span className="detail-review-count">({listing.reviewCount} đánh giá)</span>
          </div>
        </div>

        {/* Price & Availability */}
        <div className="detail-price-row">
          <div>
            <div className="detail-price">{listing.price} <span>/ tháng</span></div>
            <div className="detail-meta-row">
              <span>🏠 {listing.area} m²</span>
              <span>💰 Đặt cọc: {listing.deposit}</span>
              <span className="detail-avail">✅ {listing.available}</span>
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

        {/* Tags / Features */}
        <div className="detail-section">
          <h4 className="detail-section-title">Đặc điểm nổi bật</h4>
          <div className="detail-tags">
            {listing.tags.map(tag => (
              <span key={tag} className="detail-tag detail-tag--feature">🏷 {tag}</span>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="detail-section">
          <h4 className="detail-section-title">Tiện ích</h4>
          <div className="detail-amenities">
            {listing.amenities.map(a => (
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
            {listing.lat.toFixed(6)}, {listing.lng.toFixed(6)}
          </div>
        </div>

        {/* Landlord Contact */}
        <div className="detail-section detail-landlord">
          <h4 className="detail-section-title">Thông tin chủ nhà</h4>
          <div className="landlord-card">
            <div className="landlord-avatar-wrap">
              <img src={listing.landlord.avatar} alt={listing.landlord.name} className="landlord-avatar" />
              {listing.landlord.online && <div className="landlord-online-dot" />}
            </div>
            <div className="landlord-info">
              <div className="landlord-name">{listing.landlord.name}</div>
              <div className="landlord-meta">Tỉ lệ phản hồi: <strong>{listing.landlord.responseRate}</strong></div>
            </div>
            <a href={`tel:${listing.landlord.phone.replace(/\s/g, '')}`} className="btn-call">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12.1 19.79 19.79 0 0 1 1.65 3.5 2 2 0 0 1 3.62 1.32h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {listing.landlord.phone}
            </a>
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
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
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

    MOCK_LISTINGS.forEach(item => {
      const priceLabel = toCompactPriceLabel(item.price)
      const priceMarkerIcon = L.divIcon({
        className: 'price-marker-wrapper',
        html: `<div class="price-marker">${priceLabel}</div>`,
        popupAnchor: [-8, -40]
      })

      const marker = L.marker([item.lat, item.lng], { icon: priceMarkerIcon })
        .bindPopup(
          `<div class="listing-popup">
            <strong>${item.title}</strong>
            <div>${item.location}</div>
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

  const handleCardClick = (item: Listing) => {
    setSelectedListing(prev => prev?.id === item.id ? null : item)
    // Pan map to selected listing
    if (mapRef.current) {
      mapRef.current.flyTo([item.lat, item.lng], 15, { duration: 0.8 })
    }
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
            <h2 className="list-title">Gợi ý cho bạn ({MOCK_LISTINGS.length})</h2>
            <div className="properties-grid">
              {MOCK_LISTINGS.map(item => (
                <div
                  key={item.id}
                  className={`property-card ${selectedListing?.id === item.id ? 'property-card--selected' : ''}`}
                  onMouseEnter={() => setHoveredListingId(item.id)}
                  onMouseLeave={() => setHoveredListingId(null)}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="property-img">
                    <img src={item.images[0]} alt={item.title} loading="lazy" />
                    <div className="property-rating">
                      ⭐ {item.rating}
                    </div>
                  </div>
                  <div className="property-info">
                    <div className="property-price">{item.price} <span>/ tháng</span></div>
                    <h3 className="property-title">{item.title}</h3>
                    <div className="property-location">📍 {item.location}</div>
                    <div className="property-tags">
                      {item.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
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