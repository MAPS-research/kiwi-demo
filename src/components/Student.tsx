import { useEffect, useState } from 'react';
import { useDemo } from '../state';
import { Icon } from './Icon';
import DrawLab from './DrawLab';
import Lesson from './Lesson';

export default function Student({ screen, navigate, onAsk }: { screen: string; navigate: (screen: string) => void; onAsk: () => void }) {
  const { state, dispatch } = useDemo();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [filter, setFilter] = useState<'lesson' | 'practice'>(state.material);
  useEffect(() => setFilter(state.material), [state.material]);
  const pick = (material: 'lesson' | 'practice') => {
    dispatch({ type: 'material', material });
    if (material === 'lesson') dispatch({ type: 'page', page: 0 });
    if (window.innerWidth < 900) setDrawerOpen(false);
  };
  return <>
    <nav className="student-tabs" aria-label="Student workspace">
      <a href="#/student/materials" aria-current={screen === 'materials' ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate('materials'); }}>Materials</a>
      {state.appEnabled && <a href="#/student/draw-lab" aria-current={screen === 'draw-lab' ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate('draw-lab'); }}>Draw Lab</a>}
    </nav>
    {screen === 'draw-lab' ? <div className="custom-app-viewport"><DrawLab onAsk={onAsk} /></div> : <div className="materials-workspace">
      <nav className="material-rail" aria-label="Document tools"><button className={`icon-button ${drawerOpen ? 'selected' : ''}`} aria-label="Class materials" title="Class materials" aria-expanded={drawerOpen} aria-controls="document-drawer" onClick={() => setDrawerOpen(!drawerOpen)}><Icon name="folder" size={20} /></button></nav>
      <div className="viewer-column">
        {drawerOpen && <aside id="document-drawer" className="document-drawer" aria-label="Class materials">
          <header><h2>Class Materials</h2><button className="icon-button" aria-label="Close materials drawer" onClick={() => setDrawerOpen(false)}><Icon name="close" size={16} /></button></header>
          <div className="material-type-switch" role="group" aria-label="Material type">
            <button aria-pressed={filter === 'lesson'} onClick={() => setFilter('lesson')}>Lecture</button>
            <button aria-pressed={filter === 'practice'} onClick={() => setFilter('practice')}>Recitation</button>
          </div>
          <div className="document-list">
            {filter === 'lesson' ? <button className={state.material === 'lesson' ? 'selected' : ''} onClick={() => pick('lesson')}><span>Think in Probabilities</span>{state.material === 'lesson' && <Icon name="check" size={16} />}</button>
              : state.practiceAdded ? <button className={state.material === 'practice' ? 'selected' : ''} onClick={() => pick('practice')}><span>Count the cards<span className="sr-only"> Practice sheet</span></span>{state.material === 'practice' && <Icon name="check" size={16} />}</button>
              : <div className="document-empty"><p>No documents</p><span>Add the prepared practice sheet in Teacher → Materials.</span></div>}
          </div>
          <p className="drawer-demo-note">{filter === 'practice' ? 'Practice sheets appear as recitations in Kiwi.' : 'Original lesson · 3 pages'}</p>
        </aside>}
        <Lesson onAsk={onAsk} onLab={() => navigate('draw-lab')} />
      </div>
    </div>}
  </>;
}
