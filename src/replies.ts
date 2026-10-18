import { cardName, flushStats, percentage, type Card } from './cards';
import type { Preset, PromptId } from './content';

export function replyFor(prompt: PromptId, preset: Preset, practice: boolean, lab: boolean, drawn: Card[]) {
  if (practice) {
    return {
      text: prompt === 'two'
        ? 'Try looking at the opposite outcome: missing a heart twice. Count the unseen non-hearts first. After one non-heart is drawn, what changes in your numerator and denominator?'
        : 'Start with what you can see. How many hearts are in a complete deck, and how many are already in your hand and on the board? Subtract the known hearts, then count all the unseen cards. Try writing the fraction yourself.',
      page: prompt === 'two' ? 2 : 1,
    };
  }
  if (preset === 'guiding') {
    const stats = flushStats(drawn);
    const questions: Record<PromptId, string> = {
      flush: 'Look at A♥, 7♥, K♥, and 2♥. What do they have in common? A flush needs five cards of one suit—what would the next card need to be?',
      nine: 'There are 13 hearts in a deck. Can you find the four hearts already visible? How many hearts does that leave among the unseen cards?',
      two: 'Instead of adding two chances, try counting the chance of missing both draws. After a non-heart is revealed, how many cards—and how many hearts—remain?',
      context: lab ? stats.complete
        ? 'You have five hearts now. What can you conclude about making a flush? What would you still need to know to decide whether the hand wins?'
        : stats.drawsLeft === 0
          ? 'Both cards are revealed. Did a heart arrive? How can an outcome be possible even when it was not the most likely outcome?'
          : `There are ${stats.remaining.length} unseen cards and ${stats.drawsLeft} ${stats.drawsLeft === 1 ? 'draw' : 'draws'} left. Which unseen cards would help you, and how would you express that as a fraction?`
        : 'Look at your two hole cards and the three cards on the flop. Which suit are you closest to completing? Count the cards of that suit you can already see.',
    };
    return { text: questions[prompt], page: prompt === 'flush' ? 0 : prompt === 'two' ? 2 : 1 };
  }
  if (prompt === 'context' && lab) {
    const s = flushStats(drawn);
    const revealed = drawn.length ? `You revealed ${drawn.map(cardName).join(' and ')}. ` : '';
    return {
      text: s.complete
        ? `${revealed}There are now at least five hearts among your hole cards and the board, so the flush is complete. This tells us about your hand, not whether it beats an opponent’s hand.`
        : !s.drawsLeft
          ? `${revealed}Neither draw was a heart, so this hand did not complete the flush. The original 35.0% chance described many possible outcomes—it did not promise a flush on this attempt.`
          : `${revealed}${s.helpful.length} hearts remain among ${s.remaining.length} unseen cards. The next-card chance is ${s.helpful.length}/${s.remaining.length}, or ${percentage(s.next)}. With ${s.drawsLeft} ${s.drawsLeft === 1 ? 'draw' : 'draws'} left, the chance of completing the flush by the river is ${percentage(s.byRiver)}.`,
      page: 2,
    };
  }
  const answers: Record<PromptId, { text: string; page: number }> = {
    flush: { text: 'A flush is five cards of the same suit. You hold A♥ and 7♥, and the flop contains K♥ and 2♥. That is four hearts—one more heart on the turn or river would complete your flush. The ranks do not need to be consecutive.', page: 0 },
    nine: { text: 'A deck has 13 hearts. Four are already visible: A♥, 7♥, K♥, and 2♥. That leaves 13 − 4 = 9 helpful hearts. With five known cards overall, 52 − 5 = 47 cards are unseen. On the next draw, your chance is 9/47 ≈ 19.1%.', page: 1 },
    two: { text: 'The draws happen without replacement. On the flop, 38 of 47 unseen cards are not hearts. If you miss on the turn, 37 of the remaining 46 cards are not hearts. The chance of missing twice is (38/47) × (37/46). Subtract that from 1: about 35.0% to complete a flush by the river.', page: 2 },
    context: { text: 'Your A♥ and 7♥ join K♥ and 2♥ on the flop to make four hearts. The 9♣ does not help complete a heart flush. You need one of the nine unseen hearts on the turn or river. Let’s start by counting which cards could help.', page: 1 },
  };
  return answers[prompt];
}
