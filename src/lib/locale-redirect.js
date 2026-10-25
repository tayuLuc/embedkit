// Runs inline before paint (no module, no deferred import) to avoid a
// visible en->ru flash. localStorage remembers an explicit choice and wins.
(function () {
  try {
    var stored = localStorage.getItem('ek-lang');
    var lang =
      stored === 'en' || stored === 'ru'
        ? stored
        : (navigator.languages || [navigator.language || 'en'])[0].toLowerCase().startsWith('ru')
          ? 'ru'
          : 'en';
    var p = location.pathname.replace(/^\/embedkit(?:\/en|\/ru)(?=\/|$)/, '/embedkit/' + lang);
    if (p === location.pathname) return;
    location.replace(p + location.search + location.hash);
  } catch (e) {
    /* no-op: stay on the default locale */
  }
})();
