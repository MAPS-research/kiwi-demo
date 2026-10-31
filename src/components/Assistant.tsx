import { useCallback, useEffect, useRef, useState } from 'react';
import { LESSONS, PROMPTS, type PromptId } from '../content';
import { replyFor } from '../replies';
import { useDemo, type Message } from '../state';
import { Icon } from './Icon';
import KiwiStatusLine from './KiwiStatusLine';

export type AssistantMode = 'modal' | 'sidepanel' | 'fullscreen';
type Props = {
  lab: boolean; mode: AssistantMode; touring: boolean; panelWidth: number;
  onResize: (width: number) => void; onModeChange: (mode: AssistantMode) => void;
  onClose: () => void; onCitation: (page: number) => void;
};
type RunningAnswer = { id: string; text: string; shown: number; timer: ReturnType<typeof setTimeout> | null };

export default function Assistant({ lab, mode, touring, panelWidth, onResize, onModeChange, onClose, onCitation }: Props) {
  const { state, dispatch } = useDemo();
  const composer = useRef<HTMLTextAreaElement>(null);
  const stopButton = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const followAnswer = useRef(true);
  const running = useRef<RunningAnswer | null>(null);
  const resizeStart = useRef<{ x: number; width: number } | null>(null);
  const [selected, setSelected] = useState<PromptId | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ id: string; complete: boolean; writing: boolean } | null>(null);
  const [notice, setNotice] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const practice = !lab && state.material === 'practice';
  const context = lab ? 'Draw Lab · Current hand' : practice ? 'Count the cards · Recitation' : `Think in Probabilities · Page ${state.page + 1}`;

  // Closing the panel or switching perspectives keeps the part already shown.
  const interrupt = useCallback(() => {
    const active = running.current;
    if (!active) return;
    if (active.timer) clearTimeout(active.timer);
    dispatch({ type: 'answer', id: active.id, answer: active.text.slice(0, active.shown), stopped: true });
    running.current = null;
  }, [dispatch]);
  useEffect(() => { composer.current?.focus(); return interrupt; }, [interrupt]);
  useEffect(() => { followAnswer.current = true; endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }, [state.messages.length]);
  useEffect(() => {
    if (followAnswer.current && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.messages]);
  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const stop = () => {
    interrupt(); setBusy(false); setStatus(null);
    setAnnouncement('Answer stopped. The text shown so far is kept.');
    composer.current?.focus();
  };
  function send() {
    if (!selected || running.current) return;
    const prompt = PROMPTS.find(item => item.id === selected)!;
    const reply = replyFor(selected, state.preset, practice, lab, state.drawn);
    const id = globalThis.crypto?.randomUUID?.() ?? `reply-${Date.now()}`;
    const active: RunningAnswer = { id, text: reply.text, shown: 0, timer: null };
    running.current = active;
    setBusy(true); setNotice(''); setAnnouncement('');
    setStatus({ id, complete: false, writing: false });
    dispatch({ type: 'message', message: { id, question: prompt.text, answer: '', page: reply.page, context, pending: true } });
    composer.current?.focus();
    const reveal = () => {
      if (running.current !== active) return;
      active.shown = Math.min(active.text.length, active.shown + 32);
      dispatch({ type: 'answer', id, answer: active.text.slice(0, active.shown), pending: active.shown < active.text.length });
      setStatus({ id, complete: active.shown === active.text.length, writing: true });
      if (active.shown < active.text.length) active.timer = setTimeout(reveal, 35);
      else {
        running.current = null; setBusy(false);
        setAnnouncement('Kiwi finished the sample answer.');
        if (document.activeElement === composer.current || document.activeElement === stopButton.current) composer.current?.focus();
      }
    };
    active.timer = setTimeout(reveal, 250);
  }

  const maxWidth = Math.max(320, Math.min(800, viewportWidth - 360));
  const effectiveWidth = Math.min(panelWidth, maxWidth);
  const resize = (width: number) => onResize(Math.max(320, Math.min(maxWidth, width)));
  return <aside className={`assistant-panel ${mode === 'sidepanel' ? 'chat-sidepanel' : 'chat-dialog'} ${mode === 'fullscreen' ? 'chat-fullscreen' : ''}`}
    role={mode === 'sidepanel' ? 'complementary' : 'dialog'} aria-modal={mode === 'sidepanel' ? undefined : false}
    aria-label="Kiwi assistant" data-tour="assistant" onKeyDown={event => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault(); event.stopPropagation();
        if (busy) stop(); else onClose();
      }
    }}>
    {mode === 'sidepanel' && <div className="chat-resize" role="separator" tabIndex={0}
      aria-label="Resize chat panel" aria-orientation="vertical" aria-valuemin={320} aria-valuemax={maxWidth} aria-valuenow={effectiveWidth}
      onKeyDown={event => {
        const step = event.shiftKey ? 64 : 16;
        const next = event.key === 'ArrowLeft' ? effectiveWidth + step : event.key === 'ArrowRight' ? effectiveWidth - step
          : event.key === 'Home' ? 320 : event.key === 'End' ? maxWidth : null;
        if (next !== null) { event.preventDefault(); resize(next); }
      }}
      onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); resizeStart.current = { x: event.clientX, width: effectiveWidth }; }}
      onPointerMove={event => { if (resizeStart.current) resize(resizeStart.current.width + resizeStart.current.x - event.clientX); }}
      onPointerUp={event => { resizeStart.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { resizeStart.current = null; }} />}
    <header className="assistant-heading"><h2>Kiwi chat</h2><div className="chat-window-controls">
      {!touring && <>
        <button className="icon-button" aria-label="Modal view" title="Modal view" aria-pressed={mode === 'modal'} onClick={() => onModeChange('modal')}><Icon name="window" size={21} /></button>
        <button className="icon-button" aria-label="Side panel view" title="Side panel" aria-pressed={mode === 'sidepanel'} onClick={() => onModeChange('sidepanel')}><Icon name="panel" size={21} /></button>
        <button className="icon-button" aria-label={mode === 'fullscreen' ? 'Exit fullscreen chat' : 'Fullscreen chat'} title="Fullscreen" aria-pressed={mode === 'fullscreen'} onClick={() => onModeChange(mode === 'fullscreen' ? 'modal' : 'fullscreen')}><Icon name="expand" size={21} /></button>
      </>}
      <button className="icon-button" onClick={onClose} aria-label="Close assistant"><Icon name="close" size={24} /></button>
    </div></header>
    <div className="assistant-context"><Icon name={lab ? 'grid' : 'file'} size={18} /><span>{context}</span><span className="tag muted">Scripted demo</span></div>
    <div ref={scrollRef} className="chat-scroll" tabIndex={0} aria-label="Conversation" aria-busy={busy}
      onScroll={event => { const el = event.currentTarget; followAnswer.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48; }}>
      {!state.messages.length && <div className="chat-intro"><img src="./kiwi-mark.svg" alt="" /><h3>Ask about what you’re reading.</h3><p>{practice ? 'Choose a question below for a hint about your practice sheet.' : lab ? 'Choose a question about the cards in your current hand.' : 'Choose a sample question, then select Send.'}</p></div>}
      {state.messages.map((message, index) => <article className="chat-exchange" key={message.id ?? index} aria-label={`Question ${index + 1}`}>
        <div className="user-message">{message.question}</div>
        <div className="assistant-message">
          {message.answer && <p>{message.answer}</p>}
          {message.stopped && <span className="answer-stopped">Answer stopped{message.answer ? ' · Partial answer kept' : ''}</span>}
          {status?.id === message.id && status ? <KiwiStatusLine key={message.id} label={status.writing ? 'Showing a scripted answer…' : 'Opening the sample answer…'} complete={status.complete} onGone={() => setStatus(null)} />
            : <AnswerToolbar message={message} onNotice={setNotice} onFeedback={feedback => dispatch({ type: 'feedback', index, feedback })} />}
          {message.answer && <button className="citation" onClick={() => onCitation(message.page)}><Icon name="file" size={16} />{LESSONS[message.page].title} · p. {message.page + 1}<Icon name="arrow" size={15} /></button>}
          <span className="message-context">{message.context}</span>
        </div>
      </article>)}
      <div ref={endRef} />
    </div>
    {notice && <div className="chat-notice" role="status"><Icon name="info" size={16} /><span>{notice}</span><button className="icon-button" onClick={() => setNotice('')} aria-label="Dismiss chat notice"><Icon name="close" size={16} /></button></div>}
    <form className="assistant-prompts" onSubmit={event => { event.preventDefault(); send(); }}>
      <span className="sidebar-section-label">{practice ? 'Practice hints' : 'Try a sample question'}</span>
      <div className="prompt-grid">{PROMPTS.map(prompt => <button type="button" key={prompt.id} aria-pressed={selected === prompt.id}
        aria-disabled={busy || undefined} onClick={() => { if (!busy) { setSelected(prompt.id); composer.current?.focus(); } }}>{prompt.text}<Icon name="arrow" size={16} /></button>)}</div>
      <div className="chat-composer">
        <textarea ref={composer} aria-label="Sample question" aria-describedby="composer-help" rows={2} readOnly value={PROMPTS.find(prompt => prompt.id === selected)?.text ?? ''} placeholder="Choose a sample question above"
          onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} />
        {busy ? <button ref={stopButton} className="composer-action" type="button" aria-label="Stop answer" title="Stop answer" onClick={stop}><Icon name="stop" size={17} /></button>
          : <button className="composer-action" type="submit" aria-label="Send question" title="Send question" aria-disabled={!selected} onClick={event => { if (!selected) event.preventDefault(); }}><Icon name="send" size={20} /></button>}
      </div>
      <p id="composer-help"><Icon name="info" size={14} />Scripted examples · No live AI. Choose a question, then Send.</p>
    </form>
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
  </aside>;
}

function AnswerToolbar({ message, onFeedback, onNotice }: {
  message: Message; onFeedback: (feedback: Message['feedback']) => void; onNotice: (message: string) => void;
}) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  if (!message.answer) return null;
  return <div className="answer-toolbar" ref={ref} role="toolbar" aria-label="Answer actions" onKeyDown={event => {
    const next = event.key === 'ArrowRight' ? (active + 1) % 3 : event.key === 'ArrowLeft' ? (active + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next !== null) { event.preventDefault(); setActive(next); ref.current?.querySelectorAll('button')[next]?.focus(); }
  }}>
    <button className="icon-button" type="button" aria-label="Copy answer" title="Copy answer" tabIndex={active === 0 ? 0 : -1} onFocus={() => setActive(0)} onClick={async () => {
      try { await navigator.clipboard.writeText(message.answer); onNotice('Answer copied.'); }
      catch { onNotice('Couldn’t copy the answer. Select the text and copy it manually.'); }
    }}><Icon name="copy" size={17} /></button>
    {(['helpful', 'unhelpful'] as const).map((feedback, index) => <button className="icon-button" type="button" key={feedback}
      aria-label={feedback === 'helpful' ? 'Helpful answer' : 'Not helpful'} title={feedback === 'helpful' ? 'Helpful answer' : 'Not helpful'}
      aria-pressed={message.feedback === feedback} tabIndex={active === index + 1 ? 0 : -1} onFocus={() => setActive(index + 1)}
      onClick={() => { onFeedback(message.feedback === feedback ? undefined : feedback); onNotice('Feedback kept in this demo tab. Nothing is sent.'); }}><Icon name={feedback === 'helpful' ? 'thumbUp' : 'thumbDown'} size={17} /></button>)}
  </div>;
}
