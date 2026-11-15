(function () {
  function svg(inner) {
    return `<svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  }

  window.ICONS = {
    leaf: svg('<path d="M24 8c6 10 14 14 14 24a14 14 0 0 1-28 0C10 22 18 18 24 8z"/><path d="M24 18v20"/>'),
    necklace: svg('<path d="M10 18c4-6 24-6 28 0"/><path d="M24 20c6 2 8 10 0 18-8-8-6-16 0-18z"/>'),
    earring: svg('<path d="M18 10c0 4 4 6 4 6"/><path d="M30 10c0 4 4 6 4 6"/><circle cx="20" cy="28" r="5"/><circle cx="32" cy="30" r="6"/>'),
    bracelet: svg('<circle cx="24" cy="24" r="10"/><path d="M14 20c6-8 14-6 18 2"/>'),
    hair: svg('<path d="M8 30c8-14 24-14 32 0"/><path d="M16 26l4-10 6 10"/><path d="M24 22l4-12 6 12"/>'),
    ring: svg('<circle cx="24" cy="26" r="9"/><path d="M24 12c4 4 5 8 0 10-5-2-4-6 0-10z"/>'),
    anklet: svg('<path d="M8 28c8-8 24-8 32 0"/><path d="M16 26c3-5 7-4 8 0"/><path d="M26 24c3-6 8-4 8 1"/>'),
  };

  window.ICON_LABELS = [
    ['leaf', 'برگ'],
    ['necklace', 'گردنبند'],
    ['earring', 'گوشواره'],
    ['bracelet', 'دستبند'],
    ['hair', 'مو'],
    ['ring', 'انگشتر'],
    ['anklet', 'پابند'],
  ];
})();
