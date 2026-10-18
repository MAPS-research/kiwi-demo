import { useMemo, useState } from 'react';
import { QUESTIONS, TOPICS, type Question, type Topic } from '../analytics';
import { PRESETS, type Preset } from '../content';
import { useDemo } from '../state';
import { Icon, type IconName } from './Icon';
import { Modal } from './Modal';

const screens: { id: string; label: string; icon: IconName }[] = [
  { id: 'edit-class', label: 'Edit Class', icon: 'edit' },
  { id: 'materials', label: 'Materials', icon: 'file' },
  { id: 'apps', label: 'Class Apps', icon: 'grid' },
  { id: 'analytics', label: 'Class Analytics', icon: 'chart' },
];
type Props = {
  screen: string; navigate: (screen: string) => void;
  viewStudent: (material?: 'lesson' | 'practice', page?: number) => void;
  notify: (text: string) => void;
  navigationOpen: boolean; setNavigationOpen: (open: boolean) => void;
};
export default function Teacher(props: Props) {
  return <div className="teacher-workspace">
    {props.navigationOpen && <button className="navigation-backdrop" aria-label="Close navigation" onClick={() => props.setNavigationOpen(false)} />}
    <aside className={`teacher-sidebar ${props.navigationOpen ? 'is-open' : 'is-collapsed'}`} aria-label="Teacher navigation">
      <button className="classes-navigation" aria-expanded={props.navigationOpen} onClick={() => props.setNavigationOpen(!props.navigationOpen)} title="Classes"><Icon name="school" size={20} /><span>Classes</span><Icon name="down" size={18} /></button>
      <nav>{screens.map(screen => <a key={screen.id} href={`#/teacher/${screen.id}`} aria-label={screen.label} aria-current={props.screen === screen.id ? 'page' : undefined} title={screen.label} onClick={event => { event.preventDefault(); props.navigate(screen.id); if (window.innerWidth < 900) props.setNavigationOpen(false); }}><span className="sidebar-item-marker"><i /><Icon name={screen.icon} size={20} /></span><span>{screen.label}</span></a>)}</nav>
      <div className="teacher-sidebar-bottom"><button className="icon-button" aria-label={props.navigationOpen ? 'Collapse navigation' : 'Expand navigation'} title={props.navigationOpen ? 'Collapse navigation' : 'Expand navigation'} onClick={() => props.setNavigationOpen(!props.navigationOpen)}><Icon name={props.navigationOpen ? 'collapse' : 'menu'} size={22} /></button></div>
    </aside>
    <main className="teacher-main"><div className={`admin-page ${props.screen === 'materials' ? 'admin-page-wide' : ''}`}>
      {props.screen === 'edit-class' ? <Instructions notify={props.notify} /> : props.screen === 'apps' ? <Apps notify={props.notify} /> : props.screen === 'analytics' ? <Analytics viewStudent={props.viewStudent} /> : <Materials viewStudent={props.viewStudent} notify={props.notify} />}
    </div></main>
  </div>;
}

function Materials({ viewStudent, notify }: Pick<Props, 'viewStudent' | 'notify'>) {
  const { state, dispatch } = useDemo();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const materials = [
    { id: 'lesson' as const, title: 'Think in Probabilities', type: 'Lecture', pages: 3 },
    ...(state.practiceAdded ? [{ id: 'practice' as const, title: 'Count the cards', type: 'Recitation', pages: 1 }] : []),
  ];
  const visible = materials.filter(material => (filter === 'all' || filter === material.id) && material.title.toLowerCase().includes(query.toLowerCase()));
  return <section data-tour="teacher-materials">
    <header className="page-title-row"><div><h1>Materials</h1><p>Manage the lectures and recitations available to students.</p></div></header>
    <section className="admin-surface new-materials">
      <div className="surface-heading"><Icon name="upload" size={24} /><div><h2>New materials</h2><p>Try the prepared practice sheet. It becomes a recitation in the student’s Materials drawer.</p></div><button className="button secondary" disabled={state.practiceAdded} onClick={() => { dispatch({ type: 'practice' }); notify('Practice sheet added. It’s now available to students under Recitation.'); }}><Icon name={state.practiceAdded ? 'check' : 'plus'} size={18} />{state.practiceAdded ? 'Practice sheet added' : 'Add sample material'}</button></div>
      <div className="prepared-material"><Icon name="file" size={20} /><span><strong>Count the cards</strong><small>Practice sheet · 1 page · Hints only</small></span><span className="tag muted">Prepared example</span></div>
    </section>
    <section className="admin-surface">
      <div className="surface-heading"><Icon name="folder" size={24} /><div><h2>Materials</h2><p>{materials.length} {materials.length === 1 ? 'material' : 'materials'}</p></div></div>
      <div className="material-filters"><label className="search-field"><Icon name="search" size={20} /><input aria-label="Search titles and file names" placeholder="Search titles and file names" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="Filter materials" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All materials</option><option value="lesson">Lectures</option><option value="practice">Recitations</option></select></div>
      <div className="managed-materials">{visible.length ? visible.map(material => <div key={material.id} className="managed-group"><div className="material-section-label">{material.type === 'Lecture' ? 'Lectures' : 'Recitations'} <span>1</span></div><div className="managed-material-row"><Icon name="file" size={22} /><div><strong>{material.title}</strong><small>{material.type} · {material.pages} {material.pages === 1 ? 'page' : 'pages'}</small></div><span className="tag available">Available</span><button className="button secondary small" onClick={() => viewStudent(material.id, material.id === 'lesson' ? 0 : undefined)}>{material.id === 'lesson' ? 'View lesson' : 'View practice'}<Icon name="external" size={16} /></button></div></div>) : <p className="empty-list">Nothing matches these filters.</p>}</div>
    </section>
    <p className="field-help demo-page-note">This demo uses prepared HTML materials. Kiwi supports PDF uploads and additional material settings.</p>
  </section>;
}

function Instructions({ notify }: { notify: Props['notify'] }) {
  const { state, dispatch } = useDemo();
  const [draft, setDraft] = useState<Preset>(state.preset);
  const dirty = draft !== state.preset;
  return <section data-tour="instructions">
    <header className="page-title-row"><div><h1>Edit Class</h1><p>Update course details and assistant behavior.</p></div></header>
    <div className="settings-section"><div><h2>Basic information</h2><p>The details shown to students and instructors.</p></div><div className="class-details"><label>Class Name<input readOnly value="Texas Hold’em" /></label><label>Description<textarea readOnly value="Think in Probabilities — a short exploration of cards and chance." rows={3} /></label><span className="field-help">Sample class information is read-only in this demo.</span></div></div>
    <div className="settings-section"><div><h2>Class-specific instructions</h2><p>Added to Kiwi’s built-in instructions in every chat for this class.</p></div><div>
      <fieldset className="preset-options"><legend>Choose a demo preset</legend>{Object.entries(PRESETS).map(([key, preset]) => <label className={`preset-option ${draft === key ? 'selected' : ''}`} key={key}><input type="radio" name="preset" checked={draft === key} onChange={() => setDraft(key as Preset)} /><span><strong>{preset.title}</strong><span>{preset.description}</span></span></label>)}</fieldset>
      <label className="instruction-label">Instructions<textarea readOnly value={PRESETS[draft].instruction} rows={6} /></label>
      <p className="field-help">In Kiwi, teachers write their own instructions. These two presets change the demo’s scripted replies; practice-sheet responses always provide hints.</p>
    </div></div>
    <div className="save-row"><span role="status">{dirty ? 'Unsaved changes' : 'Current approach saved'}</span><button className="button secondary" disabled={!dirty} onClick={() => setDraft(state.preset)}>Discard changes</button><button className="button primary" disabled={!dirty} onClick={() => { dispatch({ type: 'preset', preset: draft }); notify('Instructions saved. Try a new student question to see the difference.'); }}><Icon name="save" size={18} />Save changes</button></div>
  </section>;
}

function Apps({ notify }: { notify: Props['notify'] }) {
  const { state, dispatch } = useDemo();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [enabled, setEnabled] = useState(state.appEnabled);
  const update = (value: boolean) => {
    dispatch({ type: 'app', enabled: value });
    notify(value ? 'Draw Lab is now available to students.' : 'Draw Lab is hidden from the student workspace.');
  };
  return <section data-tour="apps">
    <header className="page-title-row"><div><h1>Kiwi Apps</h1><p>Manage which apps are available for students in this class.</p></div><button className="button primary" onClick={() => { setEnabled(state.appEnabled); setPickerOpen(true); }}><Icon name="plus" size={20} />Enable Apps</button></header>
    {state.appEnabled ? <div className="admin-surface apps-table-wrap"><table className="apps-table"><thead><tr><th>Order</th><th>App</th><th>Category</th><th>Capabilities</th><th>Tab Label</th><th>Actions</th></tr></thead><tbody><tr><td>1</td><td><strong>Draw Lab</strong><small>Example custom Kiwi App</small></td><td><span className="tag muted">Learning</span></td><td><span className="tag">Student UI</span></td><td>Draw Lab</td><td><button className="text-button" onClick={() => update(false)}>Disable Draw Lab</button></td></tr></tbody></table></div> : <div className="admin-surface apps-empty"><Icon name="grid" size={36} /><h2>No Apps Enabled</h2><p>Enable Draw Lab to add it to the student workspace.</p></div>}
    <p className="field-help demo-page-note">Draw Lab is an example built for this demo. App availability is shared with the Student view.</p>
    {pickerOpen && <Modal title="Enable Apps" onClose={() => setPickerOpen(false)}><p className="modal-copy">Select the apps available to students in this class.</p><label className="app-picker-option"><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} aria-label="Enable Draw Lab" /><span><strong>Draw Lab</strong><small>Identify helpful cards and explore flush probabilities.</small><span className="tag muted">Example custom Kiwi App</span></span></label><div className="modal-actions"><button className="button secondary" onClick={() => setPickerOpen(false)}>Cancel</button><button className="button primary" onClick={() => { update(enabled); setPickerOpen(false); }}>Apply changes</button></div></Modal>}
  </section>;
}

function Analytics({ viewStudent }: Pick<Props, 'viewStudent'>) {
  const [filter, setFilter] = useState('all');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const rows = useMemo(() => QUESTIONS.filter(q => filter === 'all' || q.material === filter), [filter]);
  const displayed = topic ? rows.filter(q => q.topic === topic) : rows;
  return <section data-tour="analytics"><header className="page-title-row"><div><h1>Class Analytics</h1><p>Explore student questions, topics, and course materials.</p></div><label className="filter-label">Material<select value={filter} onChange={e => { setFilter(e.target.value); setTopic(null); }}><option value="all">All materials</option><option value="lesson">Think in Probabilities</option><option value="practice">Count the cards</option></select></label></header><div className="analytics-sample"><Icon name="info" size={16} /><span>Fixed sample snapshot · Fictional learners and questions · Includes a sample practice session</span></div><div className="metrics-grid">{[{ label: 'Questions', value: rows.length, icon: 'chat' }, { label: 'Active students', value: new Set(rows.map(q => q.student)).size, icon: 'users' }, { label: 'Topics', value: new Set(rows.map(q => q.topic)).size, icon: 'grid' }, { label: 'Active materials', value: new Set(rows.map(q => q.material)).size, icon: 'book' }].map(metric => <div className="metric" key={metric.label}><span>{metric.label}<Icon name={metric.icon as IconName} size={18} /></span><strong>{metric.value}</strong><small>In this sample</small></div>)}</div><div className="analytics-panels"><section className="topics-panel"><header><h2>Topics</h2><p>What students ask about across the class</p></header>{TOPICS.map(t => { const count = rows.filter(q => q.topic === t).length; return <button className={`topic-row ${topic === t ? 'selected' : ''}`} key={t} onClick={() => setTopic(topic === t ? null : t)} aria-pressed={topic === t}><span><strong>{t}</strong><b>{count}</b></span><span className="topic-track"><i style={{ width: `${count / Math.max(1, rows.length) * 100}%` }} /></span><small>{new Set(rows.filter(q => q.topic === t).map(q => q.student)).size} students <Icon name="arrow" size={14} /></small></button>; })}<div className="topic-footnote">Question topics help a teacher decide what to revisit in class.</div></section><section className="questions-panel"><header><div><h2>{topic || 'Student questions'}</h2><span>{displayed.length} questions</span></div>{topic && <button className="text-button" onClick={() => setTopic(null)}>Clear filter</button>}</header><div className="question-list">{displayed.map(q => <button key={q.id} className="question-row" onClick={() => setQuestion(q)}><span className="learner-avatar">{q.student.slice(-2)}</span><span><small>{q.student} <span>· {q.material === 'lesson' ? `Lesson, p. ${q.page + 1}` : 'Practice'}</span></small><strong>{q.question}</strong></span><Icon name="chevron" size={16} /></button>)}</div></section></div>{question && <Modal title="A closer look at the question" onClose={() => setQuestion(null)}><div className="question-detail"><span className="tag muted">{question.student} · Fictional sample</span><h3>{question.question}</h3><span className="reply-label"><Icon name="spark" size={15} /> SAMPLE KIWI RESPONSE</span><p>{question.answer}</p><div className="modal-actions"><button className="button secondary" onClick={() => { viewStudent('lesson', question.page); setQuestion(null); }}><Icon name="book" size={16} />Open related lesson</button></div></div></Modal>}</section>;
}
