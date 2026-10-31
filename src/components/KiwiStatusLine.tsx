import { useEffect, useRef } from 'react';
import { useDisplayPreferences } from '../theme/DisplayPreferences';
import walkLight from '../assets/kiwi/walk.light.webp';
import walkDark from '../assets/kiwi/walk.dark.webp';
import hopLight from '../assets/kiwi/hop.light.webp';
import hopDark from '../assets/kiwi/hop.dark.webp';
import standLight from '../assets/kiwi/stand.light.webp';
import standDark from '../assets/kiwi/stand.dark.webp';

const atlases = {
  light: { walk: walkLight, hop: hopLight, stand: standLight },
  dark: { walk: walkDark, hop: hopDark, stand: standDark },
};

/** Nagi's companion v2: 24 drawings, a 2 s walk and one 24 Hz departure. */
export default function KiwiStatusLine({ label, complete, onGone }: {
  label: string; complete: boolean; onGone: () => void;
}) {
  const { scheme, motionAllowed } = useDisplayPreferences();
  const camera = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const started = useRef(performance.now());
  const finished = useRef<number | null>(null);
  const visible = useRef(true);
  const callback = useRef(onGone);
  callback.current = onGone;

  useEffect(() => {
    if (!line.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; });
    observer.observe(line.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (complete && finished.current === null) finished.current = performance.now();
    const assets = atlases[scheme];
    let frame = 0;
    function draw() {
      const now = performance.now();
      const elapsed = now - (complete ? finished.current! : started.current);
      if (complete && (!motionAllowed || document.hidden || !visible.current || elapsed >= 1343)) {
        callback.current(); return;
      }
      if (camera.current && (!document.hidden && visible.current || !motionAllowed)) {
        const cell = complete ? Math.min(23, Math.floor(elapsed / (1000 / 24))) : Math.floor(elapsed / (2000 / 24)) % 24;
        camera.current.style.backgroundImage = `url("${motionAllowed ? complete ? assets.hop : assets.walk : assets.stand}")`;
        camera.current.style.backgroundSize = motionAllowed ? '600% 400%' : '100% 100%';
        camera.current.style.backgroundPosition = motionAllowed ? `${cell % 6 / 5 * 100}% ${Math.floor(cell / 6) / 3 * 100}%` : '0 0';
        if (line.current) line.current.style.opacity = complete ? String(Math.max(0, Math.min(1, (1343 - elapsed) / 176))) : '1';
      }
      if (motionAllowed) frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, [complete, motionAllowed, scheme]);

  return <div ref={line} className="kiwi-status-line" data-motion={motionAllowed ? 'on' : 'off'}>
    <span className="kiwi-stage" aria-hidden="true"><span ref={camera} className="kiwi-drawing" /></span>
    <span>{complete ? '' : label}</span>
  </div>;
}
