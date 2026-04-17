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
        const data = await authenticatedFetch('/matches/my-matches');
        // The backend dictates the shape. Map exactly what exists.
        setMatches(data.matches || data || []);
      } catch (err: any) {
        setError(err.message || 'Infrastructure Failure: Match Engine inaccessible.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="matches-layout">
        <Header />
        <main className="matches-main container" style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
          <div style={{ padding: '2rem', color: '#6b7280' }}>Loading matches...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matches-layout">
        <Header />
        <main className="matches-main container" style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
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
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            No compatible properties found in the current vector space.
          </div>
        ) : (
          <section className="matches-grid">
            {matches.map(match => (
              <MatchCard 
                key={match.user_id}
                id={match.user_id}
                name={match.full_name || match.username}
                age={match.age}
                university={match.university}
                matchPercentage={match.match_score}
                image={match.avatar_url}
                tags={[]}
                onSkip={() => setMatches(prev => prev.filter(m => m.user_id !== match.user_id))}
                onConnect={() => navigate('/chat', { state: { targetPartnerId: match.user_id } })}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
