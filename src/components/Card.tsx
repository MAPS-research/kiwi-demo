import { cardName, parts, SYMBOLS, type Card } from '../cards';
export function PlayingCard({ card, compact = false, selected, onClick, disabled = false }: { card: Card; compact?: boolean; selected?: boolean; onClick?: () => void; disabled?: boolean }) {
  const [rank, suit] = parts(card);
  const className = `playing-card ${suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'} ${compact ? 'compact' : ''} ${selected ? 'selected' : ''}`;
  const inside = <><span className="card-corner">{rank}<span>{SYMBOLS[suit]}</span></span>{!compact && <><span className="card-center">{SYMBOLS[suit]}</span><span className="card-corner bottom">{rank}<span>{SYMBOLS[suit]}</span></span></>}{selected && <span className="card-tick" aria-hidden="true">✓</span>}</>;
  return onClick
    ? <button className={className} onClick={onClick} disabled={disabled} aria-label={cardName(card)} aria-pressed={selected}>{inside}</button>
    : <span className={className} role="img" aria-label={cardName(card)}>{inside}</span>;
}
export function CardBack({ label }: { label: string }) {
  return <span className="card-back" role="img" aria-label={`${label}, not revealed`}><span className="card-back-pattern">✦</span><span className="card-back-label">{label}</span></span>;
}
