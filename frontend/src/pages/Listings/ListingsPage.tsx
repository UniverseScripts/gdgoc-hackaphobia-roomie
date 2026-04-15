import Header from '../../components/Header'
import './ListingsPage.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// --- Mock Data cho Listings ---
const MOCK_LISTINGS = [
  {
    id: 'p1',
    title: 'Phòng trọ khép kín gần ĐH Bách Khoa',
    price: '3.500.000 đ',
    location: 'Quận 10, TP.HCM',
    rating: 4.8,
    tags: ['Tự do giờ giấc', 'Toilet riêng'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400&h=300',
    lat: 10.772225,
    lng: 106.664640
  },
  {
    id: 'p2',
    title: 'Studio mini full nội thất Quận 3',
    price: '4.200.000 đ',
    location: 'Quận 3, TP.HCM',
    rating: 4.9,
    tags: ['Full nội thất', 'Cửa sổ lớn', 'An ninh'],
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=400&h=300',
    lat: 10.7833,
    lng: 106.6879
  },
  {
    id: 'p3',
    title: 'Ký túc xá cao cấp bao điện nước',
    price: '1.800.000 đ',
    location: 'Quận Tân Bình, TP.HCM',
    rating: 4.5,
    tags: ['Gần bến xe buýt', 'Bao điện nước'],
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400&h=300',
    lat: 10.8018,
    lng: 106.6595
  },
  {
    id: 'p4',
    title: 'Phòng giá rẻ cho sinh viên',
    price: '2.500.000 đ',
    location: 'Quận Bình Thạnh, TP.HCM',
    rating: 4.2,
    tags: ['Không chung chủ'],
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400&h=300',
    lat: 10.8062,
    lng: 106.7132
  }
]

function toCompactPriceLabel(price: string): string {
  const numeric = Number(price.replace(/[^\d]/g, ''))
  if (!numeric) return price
  const inMillions = numeric / 1_000_000
  const compact = Number.isInteger(inMillions) ? String(inMillions) : inMillions.toFixed(1)
  return `${compact}Tr`
}

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null)
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
      iconAnchor: [22, 22], // Center the circle
      popupAnchor: [-22, -44] // Offset the popup to appear above the marker
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
                  className="property-card"
                  onMouseEnter={() => setHoveredListingId(item.id)}
                  onMouseLeave={() => setHoveredListingId(null)}
                >
                  <div className="property-img">
                    <img src={item.image} alt={item.title} loading="lazy" />
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
      </main>
    </div>
  )
}
