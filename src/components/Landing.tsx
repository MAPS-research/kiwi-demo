import { FLOP, HOLE } from '../cards';
import { GITHUB, type Role } from '../content';
import { PlayingCard, CardBack } from './Card';
import { Icon } from './Icon';
import DisplayMenu from './DisplayMenu';
export default function Landing({ onEnter }: { onEnter: (role: Role) => void }) {
  return <main className="landing">
    <nav className="landing-nav" aria-label="Main"><a href="#/" className="brand" aria-label="Kiwi demo home"><img src="./kiwi-mark.svg" alt="" /><span>Kiwi</span><span className="brand-caption">interactive demo</span></a><div className="landing-actions"><DisplayMenu /><a className="text-link" href={GITHUB} target="_blank" rel="noreferrer"><Icon name="github" size={18} /> Open source <Icon name="external" size={14} /></a></div></nav>
    <div className="landing-hero">
      <div className="hero-copy"><span className="eyebrow"><span className="status-dot" /> One class. Two perspectives.</span><h1>See learning<br />from <span>both sides.</span></h1><p>Read a probability lesson, ask Kiwi about the cards, and try a small experiment. Then switch to Teacher to change what students see.</p><div className="hero-meta"><span><Icon name="clock" size={16} /> A few minutes</span><span><Icon name="check" size={16} /> No setup needed</span></div></div>
      <div className="hero-illustration" aria-label="Preview of the Texas Hold’em probability lesson">
        <div className="preview-window"><div className="preview-toolbar"><span className="window-dots"><i /><i /><i /></span><span>Texas Hold’em · Think in Probabilities</span><Icon name="book" size={16} /></div><div className="preview-table"><span className="eyebrow">ONE MORE HEART. WHAT ARE THE CHANCES?</span><div className="preview-cards"><div className="hand-pair">{HOLE.map(c => <PlayingCard key={c} card={c} />)}</div><span className="card-divider" /><div className="flop-trio">{FLOP.map(c => <PlayingCard key={c} card={c} />)}</div><CardBack label="?" /></div><div className="preview-labels"><span>YOUR HAND</span><span>THE POSSIBILITIES AHEAD</span></div></div><div className="preview-bottom"><span className="tag"><Icon name="lab" size={14} /> Draw Lab</span><span>Learn it. Try it. Understand it.</span></div></div>
        <div className="preview-message"><span className="assistant-avatar"><img src="./kiwi-mark.svg" alt="" /></span><div><strong>Let’s think it through.</strong><p>How many hearts can you already see?</p></div><span className="tiny-label">KIWI</span></div>
        <span className="floating-label"><Icon name="spark" size={14} /> Help that knows the context</span>
      </div>
    </div>
    <section className="choose-role" aria-labelledby="choose-role-title"><div className="section-heading"><h2 id="choose-role-title">Pick a perspective.</h2><span>You can switch anytime.</span></div><div className="role-grid">
      <button className="role-card" onClick={() => onEnter('student')}><span className="role-icon"><Icon name="book" size={25} /></span><span className="role-card-copy"><span className="role-kicker">Student workspace</span><strong>Explore as a student</strong><span>Read a lesson, ask a question, and put your intuition to the test.</span><span className="role-action">Enter the classroom <Icon name="arrow" size={18} /></span></span></button>
      <button className="role-card teacher-role" onClick={() => onEnter('teacher')}><span className="role-icon"><Icon name="school" size={26} /></span><span className="role-card-copy"><span className="role-kicker">Teacher workspace</span><strong>Explore as a teacher</strong><span>Shape the guidance, curate learning tools, and see what students ask.</span><span className="role-action">Make the class your own <Icon name="arrow" size={18} /></span></span></button>
    </div></section>
    <footer className="landing-footer"><span><span className="status-dot" /> An interactive illustration of Kiwi. Sample content and scripted AI.</span><a href={GITHUB} target="_blank" rel="noreferrer">Built for open-ended learning <Icon name="external" size={14} /></a></footer>
  </main>;
}
