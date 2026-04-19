import { useState, useRef } from 'react'
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
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false });
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // Only drag with left click or primary touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    // Prevent selecting text or opening native drag operations
    e.preventDefault(); 
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, isDragging: true });
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!drag.isDragging) return;
    const x = e.clientX - startPos.current.x;
    const y = e.clientY - startPos.current.y;
    setDrag({ x, y, isDragging: true });
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!drag.isDragging) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDrag(prev => ({ ...prev, isDragging: false }));

    const threshold = 120; // Pivot point to decide swipe action
    if (drag.x > threshold) {
      setExitDir('right');
      setTimeout(() => { if (onConnect) onConnect() }, 300);
    } else if (drag.x < -threshold) {
      setExitDir('left');
      setTimeout(() => { if (onSkip) onSkip() }, 300);
    } else {
      setDrag({ x: 0, y: 0, isDragging: false });
    }
  }

  // Calculate dynamic style
  let transform = '';
  if (exitDir === 'right') {
    transform = `translate(100vw, ${drag.y}px) rotate(45deg)`;
  } else if (exitDir === 'left') {
    transform = `translate(-100vw, ${drag.y}px) rotate(-45deg)`;
  } else if (drag.isDragging) {
    const rotation = drag.x * 0.05; // Gentle rotation as dragged
    transform = `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`;
  }

  const style = {
    transform: transform,
    transition: drag.isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
    cursor: drag.isDragging ? 'grabbing' : 'grab',
    userSelect: 'none' as const,
    touchAction: 'none' as const, // Fixes mobile scrolling interrupting drag
    zIndex: drag.isDragging ? 100 : 1
  };

  return (
    <article 
      className="match-card"
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="match-card__img-wrap">
        <img src={image} draggable="false" alt={name} className="match-card__img" loading="lazy" />
        <div className="match-card__score">
          {matchPercentage}% Match
        </div>
        
        {/* Overlay purely for visual feedback during drag */}
        {drag.isDragging && drag.x > 50 && (
          <div className="match-card__overlay match-card__overlay--like">LIKE</div>
        )}
        {drag.isDragging && drag.x < -50 && (
          <div className="match-card__overlay match-card__overlay--nope">NOPE</div>
        )}
      </div>
      
      <div className="match-card__content">
        <h3 className="match-card__name">{name}, {age}</h3>
        <p className="match-card__uni">{university}</p>
        
        <div className="match-card__tags">
          {tags.map(tag => (
            <span key={tag} className="match-tag">{tag}</span>
          ))}
        </div>
        
        <div className="match-card__actions" onPointerDown={e => e.stopPropagation()}>
          <button 
            className="btn-match btn-match--skip" 
            onClick={() => {
              setExitDir('left');
              setTimeout(() => { if (onSkip) onSkip() }, 300);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Bỏ qua
          </button>
          <button 
            className="btn-match btn-match--connect" 
            onClick={() => {
              setExitDir('right');
              setTimeout(() => { if (onConnect) onConnect() }, 300);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            Kết nối
          </button>
        </div>
      </div>
    </article>
  )
}
