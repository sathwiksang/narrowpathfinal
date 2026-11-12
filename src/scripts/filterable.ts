/**
 * Category tabs + free-text search over a list of items. Both criteria always apply together.
 *
 * Markup contract (all inside `root`):
 *   [data-filter-value]   tab buttons; value "all" matches everything
 *   [data-filter-item]    items; `data-filter-key` holds the item's category
 *   [data-filter-text]    (inside an item) elements whose text is searched
 *   [data-filter-search]  optional search <input>
 *   [data-filter-group]   optional containers hidden when none of their items match (`data-filter-key` on the group)
 *   [data-filter-empty]   optional "no results" message
 *   [data-filter-status]  optional live region announcing the result count
 */
export const initFilterable = (root: HTMLElement, noun: string): void => {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter-value]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-filter-group]')];
  const search = root.querySelector<HTMLInputElement>('[data-filter-search]');
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  const status = root.querySelector<HTMLElement>('[data-filter-status]');
  if (items.length === 0) throw new Error('initFilterable: no [data-filter-item] elements found');

  const haystack = new Map(
    items.map((item) => [
      item,
      [...item.querySelectorAll('[data-filter-text]')].map((el) => el.textContent?.toLowerCase() ?? '').join(' '),
    ]),
  );
  let active = buttons.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset['filterValue'] ?? 'all';

  // Resources filter whole groups by tab; other pages filter individual items.
  const matchesTab = (el: HTMLElement) => active === 'all' || el.dataset['filterKey'] === active;

  const apply = () => {
    const query = search?.value.trim().toLowerCase() ?? '';
    let visible = 0;
    for (const item of items) {
      const group = groups.find((g) => g.contains(item));
      const show = matchesTab(group ?? item) && (query === '' || (haystack.get(item) ?? '').includes(query));
      item.hidden = !show;
      if (show) visible++;
    }
    for (const group of groups) {
      group.hidden =
        !matchesTab(group) || ![...group.querySelectorAll<HTMLElement>('[data-filter-item]')].some((i) => !i.hidden);
    }
    if (empty) empty.hidden = visible > 0;
    if (status) status.textContent = `${visible} ${noun}${visible === 1 ? '' : 's'} shown`;
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      active = button.dataset['filterValue'] ?? 'all';
      for (const b of buttons) {
        b.setAttribute('aria-pressed', String(b === button));
        b.classList.toggle('active', b === button);
      }
      apply();
    });
  }
  search?.addEventListener('input', apply);
};
