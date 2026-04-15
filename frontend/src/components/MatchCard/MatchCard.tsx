import './MatchCard.css'

interface MatchCardProps {
  id: string
  name: string
  age: number
  university: string
  tags: string[]
  matchPercentage: number
  image: string
  onSkip?: () => void
  onConnect?: () => void
}

export default function MatchCard({
  name,
  age,
  university,
  tags,
  matchPercentage,
  image,
  onSkip,
  onConnect
}: MatchCardProps) {
  return (
    <article className="match-card">
      <div className="match-card__img-wrap">
        <img src={image} alt={name} className="match-card__img" loading="lazy" />
        <div className="match-card__score">
          {matchPercentage}% Match
        </div>
      </div>
      
      <div className="match-card__content">
        <h3 className="match-card__name">{name}, {age}</h3>
        <p className="match-card__uni">{university}</p>
        
        <div className="match-card__tags">
          {tags.map(tag => (
            <span key={tag} className="match-tag">{tag}</span>
          ))}
        </div>
        
        <div className="match-card__actions">
          <button className="btn-match btn-match--skip" onClick={onSkip}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Bỏ qua
          </button>
          <button className="btn-match btn-match--connect" onClick={onConnect}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            Kết nối
          </button>
        </div>
      </div>
    </article>
  )
}
