export function ThemeInitScript() {
  const code = `(() => {
  try {
    const stored = localStorage.getItem('theme');
    const preferred = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    if (preferred === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch {
    // ignore
  }
})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
