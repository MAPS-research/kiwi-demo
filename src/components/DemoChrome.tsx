import { COURSE, GITHUB, type Role } from '../content';
import { Icon } from './Icon';
import DisplayMenu from './DisplayMenu';

type Props = {
  role: Role;
  onRole: (role: Role) => void;
  onHome: () => void;
  onTour: () => void;
  tourLabel: string;
  onReset: () => void;
  onMenu: () => void;
  menuOpen: boolean;
};

// Demo controls sit outside the product header. Product dimensions follow
// Kiwi's TopNav (52 px header, 220 px brand column) and StudentClassLayout.
export default function DemoChrome(props: Props) {
  return <>
    <div className="demo-bar">
      <span className="demo-identity"><span className="status-dot" /><strong>Sample data</strong><span className="demo-bar-detail"> · Scripted AI</span></span>
      <div className="role-switch" data-tour="role-switch" aria-label="Choose perspective">
        {(['student', 'teacher'] as const).map(role => <button key={role} className={props.role === role ? 'active' : ''} aria-pressed={props.role === role} onClick={() => { if (role !== props.role) props.onRole(role); }}><Icon name={role === 'student' ? 'book' : 'school'} size={16} />{role === 'student' ? 'Student' : 'Teacher'}</button>)}
      </div>
      <div className="demo-actions">
        <button onClick={props.onTour}><Icon name="play" size={14} />{props.tourLabel}</button>
        <button onClick={props.onReset}><Icon name="reset" size={14} />Reset demo</button>
        <a className="icon-button demo-repository" href={GITHUB} title="Kiwi on GitHub" aria-label="Kiwi on GitHub" target="_blank" rel="noreferrer"><Icon name="github" size={18} /></a>
      </div>
    </div>
    <header className="top-nav">
      {props.role === 'teacher' && <button className="icon-button teacher-nav-toggle" aria-label="Toggle navigation menu" aria-expanded={props.menuOpen} onClick={props.onMenu}><Icon name="menu" size={24} /></button>}
      <a href="#/" className="brand" aria-label="Kiwi demo home" onClick={props.onHome}><img src="./kiwi-mark.svg" alt="" /><span>Kiwi</span></a>
      <span className="header-divider" />
      <div className="class-title"><strong>{COURSE}</strong></div>
      <span className="product-view-label">{props.role === 'student' ? 'Student view' : 'Teacher view'}</span>
      <DisplayMenu />
      <button className="icon-button product-role-action" onClick={() => props.onRole(props.role === 'student' ? 'teacher' : 'student')} aria-label={props.role === 'student' ? 'Switch to Teacher View' : 'Switch to Student View'} title={props.role === 'student' ? 'Switch to Teacher View' : 'Switch to Student View'}><Icon name={props.role === 'student' ? 'school' : 'book'} size={24} /></button>
    </header>
  </>;
}
