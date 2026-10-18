export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export type Suit = typeof SUITS[number];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export type Rank = typeof RANKS[number];
export type Card = `${Rank}-${Suit}`;
export const SYMBOLS: Record<Suit, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
export const DECK: Card[] = SUITS.flatMap(suit => RANKS.map(rank => `${rank}-${suit}` as Card));
export const HOLE: Card[] = ['A-hearts', '7-hearts'];
export const FLOP: Card[] = ['K-hearts', '2-hearts', '9-clubs'];
export const KNOWN = [...HOLE, ...FLOP];
export const parts = (card: Card) => card.split('-') as [Rank, Suit];
export function cardName(card: Card) {
  const [rank, suit] = parts(card);
  return `${({ A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' } as Record<string, string>)[rank] || rank} of ${suit}`;
}
export function remainingDeck(drawn: Card[] = []) {
  return DECK.filter(card => !KNOWN.includes(card) && !drawn.includes(card));
}
export function flushStats(drawn: Card[] = []) {
  const remaining = remainingDeck(drawn);
  const complete = drawn.some(card => parts(card)[1] === 'hearts');
  const helpful = remaining.filter(card => parts(card)[1] === 'hearts');
  const drawsLeft = Math.max(0, 2 - drawn.length);
  let miss = 1;
  for (let i = 0; i < drawsLeft; i++) miss *= (remaining.length - helpful.length - i) / (remaining.length - i);
  return {
    remaining, helpful, complete, drawsLeft,
    next: complete ? 1 : drawsLeft ? helpful.length / remaining.length : 0,
    byRiver: complete ? 1 : 1 - miss,
  };
}
export function drawCard(drawn: Card[], random = Math.random): Card | null {
  if (drawn.length >= 2) return null;
  const deck = remainingDeck(drawn);
  return deck[Math.min(deck.length - 1, Math.max(0, Math.floor(random() * deck.length)))];
}
export const percentage = (value: number) => `${(value * 100).toFixed(1)}%`;
