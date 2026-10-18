import { describe, expect, it, vi } from 'vitest';
import { DECK, KNOWN, drawCard, flushStats, remainingDeck, type Card } from './cards';
import { initialState, loadState, reducer, STORAGE_KEY } from './state';
import { replyFor } from './replies';

describe('the flush experiment', () => {
  it('has a unique standard deck and excludes the five known cards', () => {
    expect(new Set(DECK).size).toBe(52);
    expect(remainingDeck()).toHaveLength(47);
    expect(remainingDeck().some(c => KNOWN.includes(c))).toBe(false);
  });
  it('calculates next-card and two-card probabilities without counting outcomes twice', () => {
    const stats = flushStats();
    expect(stats.helpful).toHaveLength(9);
    expect(stats.next).toBeCloseTo(9 / 47, 12);
    expect(stats.byRiver).toBeCloseTo(1 - (38 / 47) * (37 / 46), 12);
    expect(stats.byRiver).toBeCloseTo(0.3496762257, 9);
  });
  it('conditions on a missed turn and recognizes both final outcomes', () => {
    const miss = flushStats(['3-clubs']);
    expect(miss.remaining).toHaveLength(46);
    expect(miss.next).toBeCloseTo(9 / 46, 12);
    expect(miss.byRiver).toBeCloseTo(9 / 46, 12);
    expect(flushStats(['3-clubs', '4-spades']).byRiver).toBe(0);
    expect(flushStats(['3-clubs', '5-hearts']).byRiver).toBe(1);
    expect(flushStats(['3-hearts']).complete).toBe(true);
  });
  it('draws without replacement at both ends of the random range', () => {
    for (const random of [() => 0, () => 0.5, () => 0.999999]) {
      const first = drawCard([], random)!;
      const second = drawCard([first], random)!;
      expect(first).not.toBe(second);
      expect(KNOWN).not.toContain(first);
      expect(KNOWN).not.toContain(second);
      expect(drawCard([first, second], random)).toBeNull();
    }
  });
  it('rejects duplicate and extra draws and resets the entire experiment', () => {
    let state = reducer(initialState(), { type: 'draw', card: '3-hearts' });
    state = reducer(state, { type: 'draw', card: '3-hearts' });
    state = reducer(state, { type: 'draw', card: 'A-hearts' });
    expect(state.drawn).toEqual(['3-hearts']);
    state = reducer(state, { type: 'draw', card: '3-clubs' });
    state = reducer(state, { type: 'draw', card: '4-clubs' });
    expect(state.drawn).toHaveLength(2);
    state = reducer(state, { type: 'select', card: '5-hearts' });
    state = reducer(state, { type: 'reset-lab' });
    expect(state.drawn).toEqual([]);
    expect(state.selected).toEqual([]);
  });
});

describe('shared state and scripted tutoring', () => {
  it('keeps settings across role navigation and restores them from storage', () => {
    let state = reducer(initialState(), { type: 'practice' });
    state = reducer(state, { type: 'app', enabled: false });
    state = reducer(state, { type: 'preset', preset: 'guiding' });
    state = reducer(state, { type: 'screen', role: 'teacher', screen: 'apps' });
    state = reducer(state, { type: 'screen', role: 'student', screen: 'materials' });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState()).toEqual(state);
    expect(reducer(state, { type: 'reset' })).toEqual(initialState());
  });
  it('restores a usable default when storage is corrupt or unavailable', () => {
    sessionStorage.setItem(STORAGE_KEY, '{');
    expect(loadState()).toEqual(initialState());
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(loadState()).toEqual(initialState());
    spy.mockRestore();
  });
  it('discards invalid stored cards and messages', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initialState(), drawn: ['3-hearts', '3-hearts', 'A-hearts', 'bad'], selected: ['3-hearts', '4-hearts', 'bad'], messages: [{ question: 'bad' }] }));
    expect(loadState().drawn).toEqual(['3-hearts']);
    expect(loadState().selected).toEqual(['4-hearts']);
    expect(loadState().messages).toEqual([]);
  });
  it('changes future replies with the saved preset but always gives practice hints', () => {
    const worked = replyFor('nine', 'worked', false, false, []);
    const guiding = replyFor('nine', 'guiding', false, false, []);
    expect(worked.text).toContain('9/47');
    expect(guiding.text).not.toContain('9/47');
    expect(guiding.text).toContain('?');
    for (const preset of ['worked', 'guiding'] as const) {
      for (const id of ['nine', 'two', 'context', 'flush'] as const) {
        const hint = replyFor(id, preset, true, false, []);
        expect(hint.text).not.toMatch(/9\/47|35\.0|19\.1/);
        expect(hint.text).toContain('?');
      }
    }
  });
  it('describes the current lab state including success and failure', () => {
    expect(replyFor('context', 'worked', false, true, ['3-clubs']).text).toContain('19.6%');
    expect(replyFor('context', 'worked', false, true, ['3-hearts']).text).toContain('flush is complete');
    expect(replyFor('context', 'worked', false, true, ['3-clubs', '4-spades']).text).toContain('did not complete');
  });
  it('retains per-role tour progress independently', () => {
    let state = reducer(initialState(), { type: 'tour', role: 'student', step: 2 });
    state = reducer(state, { type: 'tour', role: 'teacher', step: 1 });
    expect(state.tours.student.step).toBe(2);
    expect(state.tours.teacher.step).toBe(1);
  });
});
