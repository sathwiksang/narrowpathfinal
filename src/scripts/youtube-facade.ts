/**
 * Click-to-load YouTube players (see YouTubeFacade.astro).
 * Policy: only one inline player plays at a time; a player hidden by a filter is stopped; opening a
 * modal stops players behind it. Stopping restores the original thumbnail button.
 * Being a module, this runs once per page however many facades (or cloned templates) render it.
 */
import { MODAL_OPEN } from './events';

const players = new Map<HTMLIFrameElement, HTMLButtonElement>();

const stop = (iframe: HTMLIFrameElement) => {
  const facade = players.get(iframe);
  if (!facade) return;
  players.delete(iframe);
  visibility.unobserve(iframe);
  iframe.replaceWith(facade);
};

const stopAll = (keepInside?: Node) => {
  for (const iframe of [...players.keys()]) if (!keepInside?.contains(iframe)) stop(iframe);
};

// A player that stops being rendered (its card filtered out, its article closed) is stopped, not left playing.
const visibility = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting && entry.target.getClientRects().length === 0) stop(entry.target as HTMLIFrameElement);
  }
});

document.addEventListener('click', (e) => {
  const facade = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('.yt-facade') : null;
  if (!facade) return;
  stopAll();
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${facade.dataset['ytId'] ?? ''}?autoplay=1`;
  iframe.title = facade.dataset['ytTitle'] ?? 'YouTube video';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  players.set(iframe, facade);
  facade.replaceWith(iframe);
  visibility.observe(iframe);
  iframe.focus();
});

document.addEventListener(MODAL_OPEN, (e) => stopAll(e.target instanceof Node ? e.target : undefined));
