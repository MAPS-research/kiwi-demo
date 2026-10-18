import { useEffect, useRef } from 'react';
import { LESSONS, PROMPTS, type PromptId } from '../content';
import { replyFor } from '../replies';
import { useDemo } from '../state';
import { Icon } from './Icon';

export type AssistantMode = 'modal' | 'sidepanel' | 'fullscreen';
type Props = {
  lab: boolean; mode: AssistantMode; touring: boolean;
  onModeChange: (mode: AssistantMode) => void;
  onClose: () => void; onCitation: (page: number) => void;
};
export default function Assistant({ lab, mode, touring, onModeChange, onClose, onCitation }: Props) {
  const { state, dispatch } = useDemo();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const practice = !lab && state.material === 'practice';
  const context = lab ? 'Draw Lab · Current hand' : practice ? 'Count the cards · Recitation' : `Think in Probabilities · Page ${state.page + 1}`;
  useEffect(() => {
    if (mode !== 'sidepanel') dialogRef.current?.showModal();
    closeRef.current?.focus();
  }, [mode]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }, [state.messages.length]);
  function ask(id: PromptId) {
    const prompt = PROMPTS.find(item => item.id === id)!;
    const reply = replyFor(id, state.preset, practice, lab, state.drawn);
    dispatch({ type: 'message', message: { question: prompt.text, answer: reply.text, page: reply.page, context } });
  }
  const contents = <>
    <header className="assistant-heading"><h2>Kiwi Chat</h2><div className="chat-window-controls">
      {!touring && <>
        <button className="icon-button" aria-label="Modal view" title="Modal view" aria-pressed={mode === 'modal'} onClick={() => onModeChange('modal')}><Icon name="window" size={21} /></button>
        <button className="icon-button" aria-label="Side panel view" title="Side panel" aria-pressed={mode === 'sidepanel'} onClick={() => onModeChange('sidepanel')}><Icon name="panel" size={21} /></button>
        <button className="icon-button" aria-label={mode === 'fullscreen' ? 'Exit fullscreen chat' : 'Fullscreen chat'} title="Fullscreen" aria-pressed={mode === 'fullscreen'} onClick={() => onModeChange(mode === 'fullscreen' ? 'modal' : 'fullscreen')}><Icon name="expand" size={21} /></button>
      </>}
      <button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close assistant"><Icon name="close" size={24} /></button>
    </div></header>
    <div className="assistant-context"><Icon name={lab ? 'grid' : 'file'} size={18} /><span>{context}</span><span className="tag muted">Scripted demo</span></div>
    <div className="chat-scroll">
      {!state.messages.length && <div className="chat-intro"><h3>How can I help you?</h3><p>{practice ? 'Choose a question below for a hint about your practice sheet.' : lab ? 'Choose a question about the cards in your current hand.' : 'Choose a question about the material you’re reading.'}</p></div>}
      {state.messages.map((message, index) => <div className="chat-exchange" key={index}><div className="user-message">{message.question}</div><div className="assistant-message"><span className="reply-label">Kiwi <span>Scripted example</span></span><p>{message.answer}</p><button className="citation" onClick={() => onCitation(message.page)}><Icon name="file" size={16} /> {LESSONS[message.page].title} · p. {message.page + 1}<Icon name="arrow" size={15} /></button><span className="message-context">{message.context}</span></div></div>)}
      <div ref={endRef} />
    </div>
    <div className="assistant-prompts"><span className="sidebar-section-label">{practice ? 'Practice hints' : 'Try a sample question'}</span><div className="prompt-grid">{PROMPTS.map(prompt => <button key={prompt.id} onClick={() => ask(prompt.id)}>{prompt.text}<Icon name="arrow" size={16} /></button>)}</div><p><Icon name="info" size={14} /> Scripted examples · No live AI in this demo.</p></div>
  </>;
  return mode === 'sidepanel'
    ? <aside className="assistant-panel chat-sidepanel" aria-label="Kiwi assistant" data-tour="assistant" onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>{contents}</aside>
    : <dialog ref={dialogRef} className={`assistant-panel chat-dialog ${mode === 'fullscreen' ? 'chat-fullscreen' : ''}`} aria-label="Kiwi assistant" data-tour="assistant" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialogRef.current) { const rect = dialogRef.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }}>{contents}</dialog>;
}
