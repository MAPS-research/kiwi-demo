import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  sessionStorage.clear();
  window.location.hash = '/';
});
afterEach(() => cleanup());
Element.prototype.scrollIntoView = vi.fn();
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
