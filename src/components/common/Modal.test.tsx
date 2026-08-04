import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

afterEach(cleanup);

describe('Modal', () => {
  it('has dialog semantics and closes from Escape and its close button', () => {
    const close = vi.fn();
    render(<Modal open title="Review request" onClose={close}><button>Save</button></Modal>);
    expect(screen.getByRole('dialog', { name: 'Review request' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(close).toHaveBeenCalledTimes(2);
  });

  it('does not render closed content', () => {
    render(<Modal open={false} title="Hidden" onClose={() => undefined}>Secret</Modal>);
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('moves focus inside, traps keyboard focus, and restores the trigger', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open dialog';
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(
      <Modal open title="Keyboard-safe dialog" onClose={() => undefined}>
        <button type="button">Save</button>
      </Modal>,
    );

    const close = screen.getByRole('button', { name: 'Close' });
    const save = screen.getByRole('button', { name: 'Save' });
    expect(close).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(save).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();

    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('locks background scrolling only while the dialog is open', () => {
    document.body.style.overflow = 'auto';
    const { rerender } = render(
      <Modal open title="Confirm delivery" onClose={() => undefined}>
        <button>Confirm</button>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal open={false} title="Confirm delivery" onClose={() => undefined}>
        <button>Confirm</button>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('auto');
  });
});
