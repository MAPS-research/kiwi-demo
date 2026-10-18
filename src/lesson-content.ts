// Original lesson content. Double asterisks mark inline emphasis; no HTML is stored.
export type LessonBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'hand'; compact?: boolean }
  | { type: 'definitions'; items: { number: string; title: string; text: string }[] }
  | { type: 'counting'; items: { label: string; equation: string; answer: string; text: string }[] }
  | { type: 'formula'; caption: string; numerator?: number; denominator?: number; expression?: string; result: string; note: string }
  | { type: 'path'; steps: { title: string; text: string; ratio: string }[] }
  | { type: 'practice'; prompts: { title: string; text: string }[] }
  | { type: 'callout'; icon: 'spark' | 'info' | 'lab'; title: string; text: string; action?: 'lab' | 'hint'; actionLabel?: string }
  | { type: 'sources'; intro: string };

export const LESSON_BLOCKS: LessonBlock[][] = [
  [
    { type: 'paragraph', text: 'In Texas Hold’em, your two **hole cards** belong to you. The five **community cards** are shared. You make your best five-card hand using any combination of the two.' },
    { type: 'hand' },
    { type: 'heading', text: 'Four hearts. One possibility.' },
    { type: 'paragraph', text: 'A **flush** is five cards of the same suit. You can already see four hearts: two in your hand and two on the table. One more heart would complete it.' },
    { type: 'definitions', items: [
      { number: '03', title: 'The flop', text: 'The first three community cards, revealed together.' },
      { number: '04', title: 'The turn', text: 'The next community card. One more possibility.' },
      { number: '05', title: 'The river', text: 'The final community card. Your last chance.' },
    ] },
    { type: 'callout', icon: 'spark', title: 'You don’t need to know poker to think like this.', text: 'Our question is simple: how likely is another heart?' },
  ],
  [
    { type: 'paragraph', text: 'Probability starts with counting. Assume the deck is uniformly shuffled and only these five cards are known.' },
    { type: 'hand', compact: true },
    { type: 'counting', items: [
      { label: 'HEARTS LEFT', equation: '13 − 4 =', answer: '9', text: 'Thirteen hearts in the deck, minus the four you can see.' },
      { label: 'UNSEEN CARDS', equation: '52 − 5 =', answer: '47', text: 'Fifty-two cards in the deck, minus the five you know.' },
    ] },
    { type: 'formula', caption: 'Chance of completing the flush on the next card', numerator: 9, denominator: 47, result: '19.1', note: 'About one chance in five.' },
    { type: 'paragraph', text: 'Cards other players hold are still **unseen** to you. Without knowing their identities, they remain part of the 47-card uncertainty.' },
    { type: 'callout', icon: 'info', title: 'Making a flush isn’t the same as winning.', text: 'We’re measuring one event: completing five hearts. Winning also depends on your opponents’ hands.' },
  ],
  [
    { type: 'paragraph', text: 'You have two opportunities: the turn and the river. But you can’t simply double 19.1%—the deck changes after the first draw.' },
    { type: 'heading', text: 'Count the opposite outcome.' },
    { type: 'paragraph', text: 'It’s easier to find the chance of **missing both times**, then subtract it from one.' },
    { type: 'path', steps: [
      { title: 'Miss the turn', text: '38 non-hearts out of 47', ratio: '38 / 47' },
      { title: 'Then miss the river', text: '37 non-hearts out of 46', ratio: '37 / 46' },
    ] },
    { type: 'formula', caption: 'Chance of at least one heart by the river', expression: '(38/47 × 37/46)', result: '35.0', note: 'More opportunity. Still no guarantee.' },
    { type: 'callout', icon: 'lab', title: 'Now make it tangible.', text: 'Try a few draws and watch the remaining possibilities change.', action: 'lab', actionLabel: 'Open Draw Lab' },
    { type: 'sources', intro: 'This original mini-lesson uses our own explanations and card examples. Explore the underlying rules and concepts:' },
  ],
];

export const PRACTICE_SHEET = {
  title: 'Count the cards.',
  subtitle: 'A small challenge. A chance to make the idea yours.',
  label: 'YOUR TURN TO THINK',
  duration: '3 min',
  blocks: [
    { type: 'paragraph', text: 'You’re holding two hearts. Two more hearts are on the flop. Before turning over another card, take a moment to reason about what could happen.' },
    { type: 'hand' },
    { type: 'practice', prompts: [
      { title: 'Start with what you know.', text: 'How many cards can you see? How many are hearts?' },
      { title: 'Count what you can’t see.', text: 'How many cards are unseen? Which of those would complete a flush?' },
      { title: 'Think one step further.', text: 'If the turn is a club, what changes about your chance on the river?' },
    ] },
    { type: 'callout', icon: 'spark', title: 'A nudge when you need one', text: 'Kiwi gives hints on practice sheets, leaving the next step to you.', action: 'hint', actionLabel: 'Ask for a hint' },
  ] satisfies LessonBlock[],
};
