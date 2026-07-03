// Minimal hash-based router. Screens register a render(container, params) function;
// the router swaps the content of the given outlet element on navigation.

const routes = new Map();
let outlet = null;
let navButtons = null;
let unsubscribeFromStore = null;

export function registerRoute(name, renderFn) {
  routes.set(name, renderFn);
}

export function navigate(name, id) {
  location.hash = id ? `#/${name}/${id}` : `#/${name}`;
}

function parseHash() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [name, id] = hash.split("/");
  return { name: name || "home", id: id || null };
}

function renderCurrentRoute() {
  const { name, id } = parseHash();
  const renderFn = routes.get(name) ?? routes.get("home");
  const activeName = routes.has(name) ? name : "home";

  outlet.innerHTML = "";
  outlet.scrollTop = 0;
  renderFn(outlet, { id });

  if (navButtons) {
    for (const btn of navButtons) {
      btn.classList.toggle("is-active", btn.dataset.route === activeName);
    }
  }
}

export function startRouter({ outlet: outletEl, navButtons: navButtonEls, store }) {
  outlet = outletEl;
  navButtons = navButtonEls;
  window.addEventListener("hashchange", renderCurrentRoute);
  if (unsubscribeFromStore) unsubscribeFromStore();
  if (store) unsubscribeFromStore = store.onChange(renderCurrentRoute);
  renderCurrentRoute();
}
