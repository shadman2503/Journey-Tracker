import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDialogAccessibility } from './useDialogAccessibility';

describe('useDialogAccessibility hook', () => {
  let container: HTMLDivElement;
  let btn1: HTMLButtonElement;
  let btn2: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    btn1 = document.createElement('button');
    btn1.textContent = 'Button 1';
    btn2 = document.createElement('button');
    btn2.textContent = 'Button 2';

    container.appendChild(btn1);
    container.appendChild(btn2);
    document.body.appendChild(container);

    // Mock offsetParent for JSDOM
    Object.defineProperty(btn1, 'offsetParent', { value: container, configurable: true });
    Object.defineProperty(btn2, 'offsetParent', { value: container, configurable: true });
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.style.overflow = '';
    vi.restoreAllMocks();
  });

  it('locks body scroll when open and restores it when closed', () => {
    const onClose = vi.fn();
    const containerRef = { current: container };

    const { unmount } = renderHook(() =>
      useDialogAccessibility({
        isOpen: true,
        onClose,
        containerRef,
        lockScroll: true,
      })
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    const containerRef = { current: container };

    renderHook(() =>
      useDialogAccessibility({
        isOpen: true,
        onClose,
        containerRef,
        closeOnEscape: true,
      })
    );

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn();
    const containerRef = { current: container };

    renderHook(() =>
      useDialogAccessibility({
        isOpen: true,
        onClose,
        containerRef,
        closeOnEscape: false,
      })
    );

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('traps focus inside the dialog when Tab is pressed on the last element', () => {
    const onClose = vi.fn();
    const containerRef = { current: container };

    renderHook(() =>
      useDialogAccessibility({
        isOpen: true,
        onClose,
        containerRef,
      })
    );

    btn2.focus();
    expect(document.activeElement).toBe(btn2);

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');
    document.dispatchEvent(tabEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(btn1);
  });

  it('traps focus inside the dialog when Shift+Tab is pressed on the first element', () => {
    const onClose = vi.fn();
    const containerRef = { current: container };

    renderHook(() =>
      useDialogAccessibility({
        isOpen: true,
        onClose,
        containerRef,
      })
    );

    btn1.focus();
    expect(document.activeElement).toBe(btn1);

    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(shiftTabEvent, 'preventDefault');
    document.dispatchEvent(shiftTabEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(btn2);
  });
});

