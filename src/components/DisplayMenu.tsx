import { useEffect, useId, useRef, useState } from 'react';
import { useDisplayPreferences, type ColorMode } from '../theme/DisplayPreferences';
import { Icon } from './Icon';

const choices: { value: ColorMode; label: string }[] = [
  { value: 'system', label: 'Match device' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
];

export default function DisplayMenu() {
  const { mode, setMode, animation, setAnimation, reducedMotion, saved } = useDisplayPreferences();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = () => { setOpen(false); trigger.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  return <div className="display-menu" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <button ref={trigger} className="icon-button" aria-label="Display settings" title="Display settings"
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => setOpen(!open)}><Icon name="settings" size={21} /></button>
    {open && <div ref={menu} id={id} className="display-popup" role="menu" aria-label="Display settings" onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); close(); return; }
      const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
      const current = items.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'ArrowDown' ? (current + 1) % items.length
        : event.key === 'ArrowUp' ? (current + items.length - 1) % items.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
      if (next !== null) { event.preventDefault(); items[next]?.focus(); }
    }}>
      <div className="display-group-label" role="presentation">Theme</div>
      {choices.map(choice => <button key={choice.value} role="menuitemradio" aria-checked={mode === choice.value} tabIndex={-1}
        onClick={() => setMode(choice.value)}>{choice.label}{mode === choice.value && <Icon name="check" size={17} />}</button>)}
      <div className="display-divider" role="separator" />
      <button role="menuitemcheckbox" tabIndex={-1} aria-checked={animation && !reducedMotion}
        aria-disabled={reducedMotion || undefined} aria-describedby={reducedMotion ? `${id}-motion` : undefined}
        onClick={() => { if (!reducedMotion) setAnimation(!animation); }}>
        Kiwi animation<span className={`display-switch ${animation && !reducedMotion ? 'is-on' : ''}`} aria-hidden="true"><i /></span>
      </button>
      {reducedMotion && <p id={`${id}-motion`}>Your device is set to reduce motion, so Kiwi stays still.</p>}
      {!saved && <p role="status">Your browser won’t save this setting. It applies until you reload.</p>}
    </div>}
  </div>;
}
