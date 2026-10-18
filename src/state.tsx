import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { DECK, KNOWN, type Card } from './cards';
import type { Preset, Role } from './content';
export type Message = { question: string; answer: string; page: number; context: string };
export type DemoState = {
  version: 1; practiceAdded: boolean; appEnabled: boolean; preset: Preset;
  page: number; material: 'lesson' | 'practice'; drawn: Card[]; selected: Card[];
  messages: Message[]; lastScreen: Record<Role, string>;
  tours: Record<Role, { step: number; started: boolean; completed: boolean }>;
};
export const initialState = (): DemoState => ({
  version: 1, practiceAdded: false, appEnabled: true, preset: 'worked', page: 0, material: 'lesson', drawn: [], selected: [], messages: [],
  lastScreen: { student: 'materials', teacher: 'materials' },
  tours: { student: { step: 0, started: false, completed: false }, teacher: { step: 0, started: false, completed: false } },
});
export type Action =
  | { type: 'reset' } | { type: 'practice' } | { type: 'app'; enabled: boolean }
  | { type: 'preset'; preset: Preset } | { type: 'page'; page: number }
  | { type: 'material'; material: 'lesson' | 'practice' }
  | { type: 'draw'; card: Card } | { type: 'select'; card: Card } | { type: 'reset-lab' }
  | { type: 'message'; message: Message }
  | { type: 'screen'; role: Role; screen: string }
  | { type: 'tour'; role: Role; step: number; completed?: boolean };
export function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'reset': return initialState();
    case 'practice': return { ...state, practiceAdded: true };
    case 'app': return { ...state, appEnabled: action.enabled };
    case 'preset': return { ...state, preset: action.preset };
    case 'page': return { ...state, page: Math.max(0, Math.min(2, action.page)), material: 'lesson' };
    case 'material': return action.material === 'practice' && !state.practiceAdded ? state : { ...state, material: action.material };
    case 'draw': return state.drawn.length >= 2 || KNOWN.includes(action.card) || state.drawn.includes(action.card) || !DECK.includes(action.card) ? state : { ...state, drawn: [...state.drawn, action.card], selected: state.selected.filter(c => c !== action.card) };
    case 'select': return KNOWN.includes(action.card) || state.drawn.includes(action.card) ? state : { ...state, selected: state.selected.includes(action.card) ? state.selected.filter(c => c !== action.card) : [...state.selected, action.card] };
    case 'reset-lab': return { ...state, drawn: [], selected: [] };
    case 'message': return { ...state, messages: [...state.messages, action.message].slice(-20) };
    case 'screen': return { ...state, lastScreen: { ...state.lastScreen, [action.role]: action.screen } };
    case 'tour': return { ...state, tours: { ...state.tours, [action.role]: { step: Math.max(0, Math.min(3, action.step)), started: true, completed: action.completed ?? false } } };
  }
}
export const STORAGE_KEY = 'kiwi-demo-v1';
export function loadState(): DemoState {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (!value || value.version !== 1 || typeof value.practiceAdded !== 'boolean' || typeof value.appEnabled !== 'boolean' || !['worked', 'guiding'].includes(value.preset)) return initialState();
    const base = initialState();
    const drawn = Array.isArray(value.drawn) ? [...new Set<Card>(value.drawn.filter((c: Card) => DECK.includes(c) && !KNOWN.includes(c)))].slice(0, 2) : [];
    const tours = { ...base.tours };
    const lastScreen = { ...base.lastScreen };
    for (const role of ['student', 'teacher'] as const) {
      const tour = value.tours?.[role];
      if (tour && Number.isInteger(tour.step) && tour.step >= 0 && tour.step < 4) tours[role] = { step: tour.step, started: !!tour.started, completed: !!tour.completed };
      if (typeof value.lastScreen?.[role] === 'string') lastScreen[role] = value.lastScreen[role];
    }
    return { ...base, practiceAdded: value.practiceAdded, appEnabled: value.appEnabled, preset: value.preset,
      page: Number.isInteger(value.page) && value.page >= 0 && value.page < 3 ? value.page : 0,
      material: value.material === 'practice' && value.practiceAdded ? 'practice' : 'lesson', drawn,
      selected: Array.isArray(value.selected) ? [...new Set<Card>(value.selected.filter((c: Card) => DECK.includes(c) && !KNOWN.includes(c) && !drawn.includes(c)))] : [],
      messages: Array.isArray(value.messages) ? value.messages.filter((m: Message) => m && typeof m.question === 'string' && typeof m.answer === 'string' && typeof m.context === 'string' && Number.isInteger(m.page) && m.page >= 0 && m.page < 3).slice(-20) : [], tours, lastScreen,
    };
  } catch { return initialState(); }
}
const Context = createContext<{ state: DemoState; dispatch: React.Dispatch<Action> } | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* The demo remains usable without browser storage. */ } }, [state]);
  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>;
}
export function useDemo() { const context = useContext(Context); if (!context) throw new Error('Missing DemoProvider'); return context; }
