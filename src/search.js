// Use the active browser search provider, never a fallback third-party endpoint.
export async function submitSearch(input, api = globalThis, navigate = url => globalThis.location.assign(url)) {
  const text = input.trim();
  if (!text) return;
  const candidate = /^https?:\/\//i.test(text) ? text
    : /^[\w-]+(\.[\w-]+)+(:\d+)?([/?#]\S*)?$/.test(text) ? `https://${text}` : '';
  if (candidate && !/\s/.test(candidate)) {
    try { new URL(candidate); } catch { return queryBrowser(text, api); }
    navigate(candidate);
    return;
  }
  return queryBrowser(text, api);
}

function queryBrowser(text, { browser, chrome }) {
  const search = browser?.search?.query ? browser.search : chrome?.search;
  if (!search?.query) throw new Error('Browser search API unavailable');
  return search.query({ text, disposition: 'CURRENT_TAB' });
}
