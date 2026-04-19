import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authenticatedFetch } from '../../lib/api'
import Header from '../../components/Header'
import MatchCard from '../../components/MatchCard/MatchCard'
import './MatchesPage.css'

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await authenticatedFetch('/api/matches/my-matches');
        setMatches(data.matches || data || []);
      } catch (err: any) {
        const isTestRequired =
          err.message === 'PERSONALITY_TEST_REQUIRED' ||
          err.message?.includes('PERSONALITY_TEST_REQUIRED');
        if (isTestRequired) {
          navigate('/persona-test', { replace: true });
          return;
        }
        setError(err.message || 'Infrastructure Failure: Match Engine inaccessible.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [navigate]);

  const handleSkip = (id: string) => {
    setMatches(prev => prev.filter(m => m.user_id !== id));
  };

  const handleConnect = (match: any) => {
    setMatches(prev => prev.filter(m => m.user_id !== match.user_id));
    navigate('/chat', { state: { targetPartnerId: match.user_id } });
  };

  if (loading) {
    return (
      <div className="matches-layout">
        <Header />
        <main className="matches-main container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ padding: '2rem', color: '#6b7280' }}>Đang tải danh sách...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matches-layout">
        <Header />
        <main className="matches-main container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #f87171' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>SYSTEM HALTED</h2>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

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

        {matches.length === 0 ? (
          <div className="matches-empty">
            <div className="matches-empty__icon">🎉</div>
            <h2>Đã xem hết rồi!</h2>
            <p>Bạn đã xem qua tất cả người phù hợp. Quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="matches-tinder-container">
            {/* Counter */}
            <div className="matches-counter">
              <span>{matches.length}</span> người đang chờ
            </div>

            {/* Card stack — render top 3 only for performance */}
            <div className="card-stack">
              {matches.slice(0, 3).map((match, stackIndex) => {
                // stackIndex 0 = top (active), 1 = middle, 2 = bottom
                const isActive = stackIndex === 0;

                // Background cards: scale down + shift up slightly
                const scale = 1 - stackIndex * 0.05;
                const translateY = stackIndex * -12;
                const zIndex = 10 - stackIndex;

                return (
                  <div
                    key={match.user_id}
                    className={`card-stack__slot ${isActive ? 'card-stack__slot--active' : ''}`}
                    style={{
                      transform: `translateY(${stackIndex * 16}px) scale(${scale})`,
                      zIndex,
                      transition: isActive ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      pointerEvents: isActive ? 'auto' : 'none',
                      filter: stackIndex === 0 ? 'none' : `brightness(${1 - stackIndex * 0.06})`,
                    }}
                  >
                    <MatchCard
                      key={match.user_id}
                      id={match.user_id}
                      name={match.full_name || match.username || 'Người dùng'}
                      age={match.age || 20}
                      university={match.university || 'Trường đại học'}
                      matchPercentage={match.match_score || 75}
                      image={match.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.user_id}`}
                      tags={match.tags || []}
                      onSkip={() => handleSkip(match.user_id)}
                      onConnect={() => handleConnect(match)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Hint text */}
            <p className="matches-swipe-hint">
              ← Bỏ qua &nbsp;|&nbsp; Kết nối →
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
