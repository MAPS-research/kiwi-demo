import { Fragment, useEffect, useRef, useState } from 'react';
import { FLOP, HOLE } from '../cards';
import { LESSONS, SOURCES } from '../content';
import { LESSON_BLOCKS, PRACTICE_SHEET, type LessonBlock } from '../lesson-content';
import { useDemo } from '../state';
import { PlayingCard, CardBack } from './Card';
import { Icon } from './Icon';

type Actions = { onAsk: () => void; onLab: () => void };

export default function Lesson({ onAsk, onLab }: Actions) {
  const { state, dispatch } = useDemo();
  const practice = state.material === 'practice';
  const page = LESSONS[state.page];
  const [zoom, setZoom] = useState(100);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  const blocks = practice ? PRACTICE_SHEET.blocks : LESSON_BLOCKS[state.page];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousPage = useRef(`${state.material}:${state.page}`);
  useEffect(() => {
    const current = `${state.material}:${state.page}`;
    if (previousPage.current !== current) {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      previousPage.current = current;
    }
  }, [state.material, state.page]);

  return <section className={`reader ${expanded ? 'reader-expanded' : ''}`} data-tour="lesson" aria-label={practice ? 'Count the cards practice sheet' : 'Course lesson'}>
    <div className="reader-toolbar">
      <strong className="reader-filename">{practice ? 'Count the cards' : 'Think in Probabilities'}</strong>
      <nav className="reader-page-controls" aria-label="Lesson pages">
        <button className="icon-button" aria-label="Previous" title="Previous page" disabled={practice || state.page === 0} onClick={() => dispatch({ type: 'page', page: state.page - 1 })}><Icon name="back" size={20} /></button>
        <span aria-live="polite">{practice ? '1 / 1' : `${state.page + 1} / 3`}</span>
        <button className="icon-button" aria-label="Next" title="Next page" disabled={practice || state.page === 2} onClick={() => dispatch({ type: 'page', page: state.page + 1 })}><Icon name="chevron" size={20} /></button>
      </nav>
      <span className="reader-control-divider" />
      <div className="reader-zoom-controls">
        <button className="icon-button" aria-label="Zoom out" disabled={zoom === 75} onClick={() => setZoom(zoom - 25)}><Icon name="minus" size={18} /></button>
        <span>{zoom}%</span>
        <button className="icon-button" aria-label="Zoom in" disabled={zoom === 150} onClick={() => setZoom(zoom + 25)}><Icon name="plus" size={18} /></button>
      </div>
      <span className="reader-control-divider zoom-divider" />
      <button className="icon-button expand-reader" aria-label={expanded ? 'Restore document view' : 'Expand document'} aria-pressed={expanded} onClick={() => setExpanded(!expanded)}><Icon name={expanded ? 'close' : 'expand'} size={20} /></button>
    </div>
    <div className="reader-scroll">
    <article className="lesson-page" style={{ zoom: zoom / 100 }}>
      <div className="lesson-meta">
        <span className="eyebrow">{practice ? PRACTICE_SHEET.label : `0${state.page + 1} / ${page.label.toUpperCase()}`}</span>
        <span><Icon name="clock" size={14} /> {practice ? PRACTICE_SHEET.duration : page.duration}</span>
      </div>
      <h1 ref={headingRef} tabIndex={-1} id="lesson-heading">{practice ? PRACTICE_SHEET.title : page.title}</h1>
      <p className="lesson-subtitle">{practice ? PRACTICE_SHEET.subtitle : page.subtitle}</p>
      {blocks.map((block, index) => <Block key={`${state.material}-${state.page}-${index}`} block={block} onAsk={onAsk} onLab={onLab} />)}
      <div className="lesson-bottom-note"><span className="mini-brand">kiwi</span><span>Think in Probabilities · A sample class</span></div>
    </article>
    </div>
  </section>;
}

function InlineText({ text }: { text: string }) {
  return <>{text.split(/(\*\*.*?\*\*)/g).map((part, index) => part.startsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : part)}</>;
}

function Block({ block, onAsk, onLab }: Actions & { block: LessonBlock }) {
  switch (block.type) {
    case 'paragraph': return <p><InlineText text={block.text} /></p>;
    case 'heading': return <h2>{block.text}</h2>;
    case 'hand': return <HandDiagram compact={block.compact} />;
    case 'definitions': return <div className="lesson-definitions">{block.items.map(item => <div key={item.number}><span className="definition-number">{item.number}</span><strong>{item.title}</strong><span>{item.text}</span></div>)}</div>;
    case 'counting': return <div className="counting-grid">{block.items.map(item => <div key={item.label}><span className="eyebrow">{item.label}</span><strong>{item.equation} <em>{item.answer}</em></strong><p>{item.text}</p></div>)}</div>;
    case 'formula': return <div className="formula-block">
      <span>{block.caption}</span>
      {block.expression && <strong className="long-formula">1 − <span>{block.expression}</span></strong>}
      <strong>{block.numerator !== undefined && <span className="fraction"><span>{block.numerator}</span><span>{block.denominator}</span></span>}<span className={block.expression ? undefined : 'formula-equals'}>≈</span>{block.result}<span className="percent-sign">%</span></strong>
      <span>{block.note}</span>
    </div>;
    case 'path': return <div className="probability-path">{block.steps.map((step, index) => <Fragment key={step.title}>{index > 0 && <Icon name="arrow" />}<div><span className="step-circle">{index + 1}</span><strong>{step.title}</strong><span>{step.text}</span><b>{step.ratio}</b></div></Fragment>)}</div>;
    case 'practice': return <ol className="practice-list">{block.prompts.map(prompt => <li key={prompt.title}><strong>{prompt.title}</strong><span>{prompt.text}</span></li>)}</ol>;
    case 'callout': return <div className="callout"><Icon name={block.icon} /><div><strong>{block.title}</strong><p>{block.text}</p>{block.action && <button className="text-button" onClick={block.action === 'lab' ? onLab : onAsk}>{block.actionLabel}<Icon name="arrow" size={16} /></button>}</div></div>;
    case 'sources': return <details className="source-details"><summary>Further reading & sources</summary><p>{block.intro}</p>{SOURCES.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><strong>{source.title} <Icon name="external" size={13} /></strong><span>{source.description}</span></a>)}</details>;
  }
}

function HandDiagram({ compact = false }: { compact?: boolean }) {
  return <figure className={`hand-diagram ${compact ? 'small-diagram' : ''}`}>
    <div className="diagram-hand"><div className="diagram-cards">{HOLE.map(card => <PlayingCard key={card} card={card} />)}</div><figcaption>YOUR HOLE CARDS</figcaption></div>
    <span className="diagram-plus">+</span>
    <div className="diagram-board"><div className="diagram-cards">{FLOP.map(card => <PlayingCard key={card} card={card} />)}<CardBack label="Turn" /><CardBack label="River" /></div><figcaption>THE COMMUNITY CARDS</figcaption></div>
  </figure>;
}
