import Header from '../../components/Header'
import './ListingsPage.css'
import { useState } from 'react'

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
    lat: 45, // % position on mock map
    lng: 30
  },
  {
    id: 'p2',
    title: 'Studio mini full nội thất Quận 3',
    price: '4.200.000 đ',
    location: 'Quận 3, TP.HCM',
    rating: 4.9,
    tags: ['Full nội thất', 'Cửa sổ lớn', 'An ninh'],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1bd280d924?auto=format&fit=crop&q=80&w=400&h=300',
    lat: 35,
    lng: 60
  },
  {
    id: 'p3',
    title: 'Ký túc xá cao cấp bao điện nước',
    price: '1.800.000 đ',
    location: 'Quận Tân Bình, TP.HCM',
    rating: 4.5,
    tags: ['Gần bến xe buýt', 'Bao điện nước'],
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400&h=300',
    lat: 60,
    lng: 50
  },
  {
    id: 'p4',
    title: 'Phòng giá rẻ cho sinh viên',
    price: '2.500.000 đ',
    location: 'Quận Bình Thạnh, TP.HCM',
    rating: 4.2,
    tags: ['Không chung chủ'],
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400&h=300',
    lat: 20,
    lng: 70
  }
]

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')

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
                <div key={item.id} className="property-card">
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
          {/* Fake map background using a solid color & grid pattern or subtle image */}
          <div className="mock-map">
            {/* Render Mock Markers */}
            {MOCK_LISTINGS.map(item => (
              <div 
                key={item.id} 
                className="map-marker"
                style={{ top: `${item.lat}%`, left: `${item.lng}%` }}
              >
                {item.price.split(' ')[0]}
              </div>
            ))}
            
            {/* Map UI overlays */}
            <div className="map-controls">
              <button className="map-ctrl-btn">+</button>
              <button className="map-ctrl-btn">-</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
