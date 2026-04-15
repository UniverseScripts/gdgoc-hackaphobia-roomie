import Header from '../../components/Header'
import MatchCard from '../../components/MatchCard/MatchCard'
import './MatchesPage.css'

const MOCK_MATCHES = [
  {
    id: 'm1',
    name: 'Minh Tuấn',
    age: 20,
    university: 'ĐH Bách Khoa TP.HCM',
    tags: ['Dậy sớm', 'Gọn gàng', 'Không hút thuốc', 'Hướng nội'],
    matchPercentage: 95,
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'm2',
    name: 'Thảo Vy',
    age: 19,
    university: 'ĐH Khoa học Tự nhiên',
    tags: ['Cú đêm', 'Thoải mái', 'Hòa đồng', 'Thích nấu ăn'],
    matchPercentage: 88,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'm3',
    name: 'Hoàng Phát',
    age: 21,
    university: 'ĐH Kinh tế TP.HCM',
    tags: ['Không hút thuốc', 'Gọn gàng', 'Hướng ngoại'],
    matchPercentage: 82,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'm4',
    name: 'Ngọc Lan',
    age: 18,
    university: 'ĐH Tôn Đức Thắng',
    tags: ['Dậy sớm', 'Không nuôi pet', 'Thích yên tĩnh'],
    matchPercentage: 75,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&h=400'
  }
]

export default function MatchesPage() {
  return (
    <div className="matches-layout">
      <Header />
      
      <main className="matches-main container">
        <header className="matches-header">
          <div className="matches-title-wrap">
            <h1 className="matches-title">Ghép đôi Roommate</h1>
            <p className="matches-subtitle">Tìm những người bạn chung phòng có cùng lối sống với bạn.</p>
          </div>
          
          <button className="btn-filter-advanced">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Bộ lọc nâng cao
          </button>
        </header>

        <section className="matches-grid">
          {MOCK_MATCHES.map(match => (
            <MatchCard 
              key={match.id}
              {...match}
              onSkip={() => console.log('Skip', match.name)}
              onConnect={() => console.log('Connect', match.name)}
            />
          ))}
        </section>
      </main>
    </div>
  )
}
