import { MODAL_OPEN } from './events';
import { lockScroll, unlockScroll } from './scroll-lock';

interface ModalOptions {
  /** Close when the dimmed area around the content is clicked. */
  closeOnBackdrop: boolean;
  /** Runs after the modal closes (e.g. to stop an embedded video). */
  onClose?: () => void;
}

/**
 * Wraps a native <dialog>: the browser provides focus containment, Escape-to-close and focus return.
 * The legacy `.active` class is kept in sync because the page styles key off it.
 * Elements inside the dialog marked `data-modal-close` close it.
 */
export const createModal = (dialog: HTMLDialogElement, { closeOnBackdrop, onClose }: ModalOptions) => {
  const close = () => {
    if (dialog.open) dialog.close();
  };

  dialog.addEventListener('close', () => {
    dialog.classList.remove('active');
    unlockScroll();
    onClose?.();
  });
  if (closeOnBackdrop) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) close();
    });
  }
  for (const btn of dialog.querySelectorAll('[data-modal-close]')) btn.addEventListener('click', close);

  return {
    open: () => {
      if (dialog.open) return;
      dialog.classList.add('active');
      dialog.showModal();
      lockScroll();
      dialog.dispatchEvent(new Event(MODAL_OPEN, { bubbles: true }));
    },
  };
};
