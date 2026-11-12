/** Dispatched (bubbling) by a modal dialog when it opens; `event.target` is the dialog. */
export const MODAL_OPEN = 'site:modal-open';

/**
 * True for an ordinary primary-button click. Cmd/Ctrl/Shift/Alt-clicks and middle clicks on links
 * must keep their native meaning (new tab, new window, download) instead of being intercepted.
 */
const isPlainClick = (e: MouseEvent): boolean => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/** Whether an intercepted click on `target` should be left to the browser (modified click on a link). */
export const isNativeLinkClick = (e: MouseEvent, target: Element): boolean =>
  target.closest('a[href]') !== null && !isPlainClick(e);
