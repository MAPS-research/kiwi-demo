import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { DemoProvider, loadState, STORAGE_KEY } from './state';
import { DISPLAY_STORAGE_KEY } from './theme/DisplayPreferences';

function renderDemo() { return render(<DemoProvider><App /></DemoProvider>); }
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('display preferences', () => {
  it('persists the chosen theme across roles and a reload, with keyboard menu navigation', async () => {
    const user = userEvent.setup();
    const view = renderDemo();
    await user.click(screen.getByRole('button', { name: 'Display settings' }));
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Display settings' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: /Explore as a student/ }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(JSON.parse(localStorage.getItem(DISPLAY_STORAGE_KEY)!).mode).toBe('dark');
    view.unmount(); renderDemo();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('follows device changes and keeps reduced motion authoritative', async () => {
    const listeners = new Map<string, () => void>();
    let dark = false;
    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() { return query.includes('reduced-motion') || dark; },
      addEventListener: (_: string, listener: () => void) => listeners.set(query, listener),
      removeEventListener: vi.fn(),
    }));
    const user = userEvent.setup(); renderDemo();
    act(() => { dark = true; listeners.get('(prefers-color-scheme: dark)')?.(); });
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await user.click(screen.getByRole('button', { name: 'Display settings' }));
    const motion = screen.getByRole('menuitemcheckbox', { name: 'Kiwi animation' });
    expect(motion).toHaveAttribute('aria-disabled', 'true');
    await user.click(motion);
    expect(motion).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(/Your device is set to reduce motion/)).toBeVisible();
  });

  it('still changes theme when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Blocked'); });
    const user = userEvent.setup(); renderDemo();
    await user.click(screen.getByRole('button', { name: 'Display settings' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByText(/Your browser won’t save/)).toBeVisible();
  });
});

describe('chat controls', () => {
  function open() {
    vi.useFakeTimers();
    window.location.hash = '/student/materials';
    renderDemo();
    fireEvent.click(screen.getByRole('button', { name: 'Ask Kiwi' }));
    fireEvent.click(screen.getByRole('button', { name: 'Why are there nine helpful cards?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
  }

  it('stops a partial answer without losing it, including on subsequent reload', () => {
    open();
    act(() => vi.advanceTimersByTime(300));
    const before = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).messages[0].answer;
    expect(before.length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Stop answer' }));
    act(() => vi.advanceTimersByTime(3000));
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).messages[0];
    expect(saved.answer).toBe(before);
    expect(saved.stopped).toBe(true);
    expect(screen.getByRole('textbox', { name: 'Sample question' })).toHaveFocus();
    expect(loadState().messages[0].stopped).toBe(true);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    act(() => vi.advanceTimersByTime(20));
    expect(screen.getByRole('button', { name: 'Ask Kiwi' })).toHaveFocus();
  });

  it('preserves an interrupted reply on reload and never resumes after closing', () => {
    open(); act(() => vi.advanceTimersByTime(300));
    expect(loadState().messages[0].stopped).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Close assistant' }));
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).messages[0];
    act(() => vi.advanceTimersByTime(3000));
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).messages[0]).toEqual(saved);
    expect(saved.stopped).toBe(true);
  });

  it('keeps the page interactive, resizes by keyboard, and exposes feedback after the animation', () => {
    open();
    expect(screen.getByRole('dialog', { name: 'Kiwi assistant' })).toHaveAttribute('aria-modal', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Recitation' }));
    expect(screen.getByText('No recitations yet')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Side panel view' }));
    const grip = screen.getByRole('separator', { name: 'Resize chat panel' });
    fireEvent.keyDown(grip, { key: 'ArrowLeft' });
    expect(grip).toHaveAttribute('aria-valuenow', '456');
    fireEvent.keyDown(grip, { key: 'Home' });
    expect(grip).toHaveAttribute('aria-valuenow', '320');
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByText('Kiwi finished the sample answer.')).toBeInTheDocument();
    expect(screen.queryByRole('toolbar', { name: 'Answer actions' })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1500));
    const toolbar = screen.getByRole('toolbar', { name: 'Answer actions' });
    const copy = within(toolbar).getByRole('button', { name: 'Copy answer' });
    copy.focus(); fireEvent.keyDown(copy, { key: 'ArrowRight' });
    const helpful = within(toolbar).getByRole('button', { name: 'Helpful answer' });
    expect(helpful).toHaveFocus();
    fireEvent.click(helpful);
    expect(helpful).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).messages[0].feedback).toBe('helpful');
  });
});
