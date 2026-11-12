/** Reference-counted page scroll lock shared by the mobile menu and all modals. */
let locks = 0;

export const lockScroll = (): void => {
  if (locks++ === 0) document.body.style.overflow = 'hidden';
};

export const unlockScroll = (): void => {
  if (locks > 0 && --locks === 0) document.body.style.overflow = '';
};
