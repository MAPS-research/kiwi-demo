import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { GITHUB, TOURS, type Role } from './content';
import { useDemo } from './state';
import { Icon } from './components/Icon';
import { Modal } from './components/Modal';
import Landing from './components/Landing';
import Student from './components/Student';
import Assistant, { type AssistantMode } from './components/Assistant';
import DemoChrome from './components/DemoChrome';
const Teacher = lazy(() => import('./components/Teacher'));
function parseRoute(hash: string): { role: Role | null; screen: string } {
  const [role, screen] = hash.replace(/^#\/?/, '').split('/');
  if (role !== 'student' && role !== 'teacher') return { role: null, screen: '' };
  const allowed = role === 'student' ? ['materials', 'draw-lab'] : ['materials', 'edit-class', 'apps', 'analytics'];
  return { role, screen: allowed.includes(screen) ? screen : 'materials' };
}
export default function App() {
  const { state, dispatch } = useDemo();
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const [assistant, setAssistant] = useState(false);
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('modal');
  const [navigationOpen, setNavigationOpen] = useState(() => window.innerWidth >= 900);
  const [tourActive, setTourActive] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [completion, setCompletion] = useState<Role | null>(null);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const notify = useCallback((message: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(''), 6500);
  }, []);
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);
  useEffect(() => {
    const handler = () => { setRoute(parseRoute(window.location.hash)); };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  const go = useCallback((role: Role, screen: string) => {
    window.location.hash = `/${role}/${screen}`;
    setRoute({ role, screen });
  }, []);
  useEffect(() => {
    if (route.role) dispatch({ type: 'screen', role: route.role, screen: route.screen });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route.role, route.screen, dispatch]);
  useEffect(() => {
    if (route.role === 'student' && route.screen === 'draw-lab' && !state.appEnabled) {
      go('student', 'materials');
      notify('Draw Lab is disabled for this class. Switch to Teacher → Class Apps to enable it.');
    }
  }, [route.role, route.screen, state.appEnabled, go, notify]);
  useEffect(() => { if (route.role !== 'student') setAssistant(false); }, [route.role]);
  const switchRole = (role: Role) => { setTourActive(false); setAssistant(false); go(role, state.lastScreen[role]); };
  const navigate = (screen: string) => { setTourActive(false); if (route.role) go(route.role, screen); };
  const viewStudent = (material?: 'lesson' | 'practice', page?: number) => {
    setTourActive(false); setAssistant(false);
    if (material) dispatch({ type: 'material', material });
    if (page !== undefined) dispatch({ type: 'page', page });
    go('student', 'materials');
  };
  const openAssistant = () => { setAssistantMode('modal'); setAssistant(true); };
  const closeAssistant = () => { setAssistant(false); requestAnimationFrame(() => document.getElementById('assistant-launcher')?.focus()); };
  const activateStep = (role: Role, step: number) => {
    dispatch({ type: 'tour', role, step }); setTourActive(true);
    const target = TOURS[role][step];
    go(role, target.screen === 'draw-lab' && !state.appEnabled ? 'materials' : target.screen);
    setAssistant(!!target.assistant);
    if (target.assistant) setAssistantMode('sidepanel');
  };
  const activeStep = route.role && tourActive ? TOURS[route.role][state.tours[route.role].step] : null;
  useEffect(() => {
    if (!assistant || !shellRef.current || !workspaceRef.current) return;
    const update = () => {
      const top = workspaceRef.current?.getBoundingClientRect().top ?? 94;
      const controlsBottom = controlsRef.current?.getBoundingClientRect().bottom ?? 94;
      shellRef.current?.style.setProperty('--assistant-top', `${Math.max(controlsBottom, top)}px`);
    };
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(shellRef.current);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); window.removeEventListener('scroll', update); };
  }, [assistant, tourActive, activeStep]);
  useEffect(() => {
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    if (activeStep) document.querySelector(`[data-tour="${activeStep.target}"]`)?.classList.add('tour-highlight');
    return () => { document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight')); };
  }, [activeStep, route.screen]);
  useEffect(() => {
    if (!route.role || !tourActive) return;
    const expected = TOURS[route.role][state.tours[route.role].step].screen;
    if (route.screen !== expected && !(expected === 'draw-lab' && !state.appEnabled && route.screen === 'materials')) setTourActive(false);
  }, [route.screen, route.role, state.tours, state.appEnabled, tourActive]);
  if (!route.role) return <Landing onEnter={switchRole} />;
  const role = route.role;
  const tour = state.tours[role];
  return <div ref={shellRef} className={`app-shell ${assistant && assistantMode === 'sidepanel' ? 'with-assistant' : ''} ${tourActive ? 'tour-running' : ''}`}>
    <div ref={controlsRef} className="global-controls"><DemoChrome role={role} onRole={switchRole} onHome={() => { setTourActive(false); setAssistant(false); }} onTour={() => { if (tourActive) setTourActive(false); else activateStep(role, tour.completed ? 0 : tour.step); }} tourLabel={tourActive ? 'Pause tour' : tour.completed ? 'Replay tour' : tour.started ? 'Continue tour' : 'Take a tour'} onReset={() => setResetOpen(true)} onMenu={() => setNavigationOpen(!navigationOpen)} menuOpen={navigationOpen} /></div>
    {activeStep && <section className="tour-bar" aria-label={`${role} tour`}><div className="tour-step-indicator"><Icon name="spark" size={19} /><span>{tour.step + 1}<small>/ 4</small></span></div><div className="tour-text"><span className="eyebrow">{role.toUpperCase()} TOUR</span><h2>{activeStep.title}</h2><p>{activeStep.screen === 'draw-lab' && !state.appEnabled ? 'Draw Lab is currently disabled. Switch to Teacher → Class Apps to enable it, then continue this tour. You can also skip this step.' : activeStep.body}</p></div><div className="tour-controls"><button className="text-button" onClick={() => activateStep(role, 0)}>Restart</button><button className="text-button" onClick={() => setTourActive(false)}>Skip tour</button><button className="button secondary small" disabled={tour.step === 0} onClick={() => activateStep(role, tour.step - 1)}>Back</button><button className="button primary small" onClick={() => { if (tour.step < 3) activateStep(role, tour.step + 1); else { dispatch({ type: 'tour', role, step: 3, completed: true }); setTourActive(false); setCompletion(role); } }}>{tour.step === 3 ? 'Finish' : 'Next'}<Icon name="arrow" size={15} /></button></div></section>}
    <div ref={workspaceRef} className="workspace-content">{role === 'student' ? <main className="student-main"><Student screen={route.screen} navigate={navigate} onAsk={openAssistant} /></main> : <Suspense fallback={<div className="loading-page" role="status">Opening the teacher workspace…</div>}><Teacher navigationOpen={navigationOpen} setNavigationOpen={setNavigationOpen} screen={route.screen} navigate={navigate} viewStudent={viewStudent} notify={notify} /></Suspense>}</div>
    {role === 'student' && !assistant && <button id="assistant-launcher" className={`assistant-launcher ${route.screen === 'draw-lab' ? 'on-app' : ''}`} title="Open Kiwi Chat" onClick={openAssistant} aria-label="Ask Kiwi"><Icon name="chat" size={24} /></button>}
    {assistant && role === 'student' && <Assistant mode={assistantMode} onModeChange={setAssistantMode} touring={tourActive} lab={route.screen === 'draw-lab'} onClose={closeAssistant} onCitation={page => { dispatch({ type: 'page', page }); navigate('materials'); closeAssistant(); }} />}
    {notice && <div className="toast" role="status"><Icon name="info" size={18} /><span>{notice}</span><button className="icon-button" onClick={() => setNotice('')} aria-label="Dismiss notification"><Icon name="close" size={16} /></button></div>}
    {resetOpen && <Modal title="Start fresh?" onClose={() => setResetOpen(false)}><p className="modal-copy">Reset the sample class, card draws, conversation, and tours. You’ll return to the perspective chooser.</p><div className="modal-actions"><button className="button secondary" onClick={() => setResetOpen(false)}>Keep exploring</button><button className="button primary" onClick={() => { dispatch({ type: 'reset' }); setTourActive(false); setAssistant(false); setResetOpen(false); setNotice(''); if (noticeTimer.current) clearTimeout(noticeTimer.current); window.location.hash = '/'; setRoute({ role: null, screen: '' }); }}>Reset demo</button></div></Modal>}
    {completion && <Modal title="A different way to bring learning together." onClose={() => setCompletion(null)}><div className="tour-complete"><span className="completion-icon"><Icon name="check" size={30} /></span><p>You’ve explored the {completion} perspective. See how the other side connects—or take a closer look at the open-source framework.</p><button className="button primary" onClick={() => { switchRole(completion === 'student' ? 'teacher' : 'student'); setCompletion(null); }}>Explore as a {completion === 'student' ? 'teacher' : 'student'}<Icon name="arrow" size={16} /></button><a className="button secondary" href={GITHUB} target="_blank" rel="noreferrer"><Icon name="github" size={17} />Kiwi on GitHub<Icon name="external" size={14} /></a></div></Modal>}
  </div>;
}
