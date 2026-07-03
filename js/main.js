import { store, getStaminaMax, regenStamina } from "./state.js";
import { registerRoute, startRouter, navigate } from "./router.js";
import { el, formatNumber } from "./utils.js";

import { renderHome } from "./ui/home.js";
import { renderPull } from "./ui/pull.js";
import { renderRoster } from "./ui/roster.js";
import { renderCharacterDetail } from "./ui/characterDetail.js";
import { renderTeamBuilder } from "./ui/teamBuilder.js";
import { renderBattleHub, renderBattleStage } from "./ui/battle.js";
import { renderShop } from "./ui/shop.js";
import { renderSettings } from "./ui/settings.js";

const NAV_ITEMS = [
  { route: "home", label: "Home" },
  { route: "pull", label: "Pull" },
  { route: "roster", label: "Roster" },
  { route: "team", label: "Team" },
  { route: "battle", label: "Battle" },
  { route: "shop", label: "Shop" },
  { route: "settings", label: "Settings" }
];

function buildShell() {
  const app = document.getElementById("app");

  const topbar = el("header", { class: "topbar" }, [
    el("div", { class: "topbar__brand" }, "✦ Gacha RPG"),
    el("div", { class: "topbar__currencies", id: "currency-display" })
  ]);

  const nav = el("nav", { class: "nav" },
    NAV_ITEMS.map((item) =>
      el("button", {
        class: "nav__btn",
        dataset: { route: item.route },
        onclick: () => navigate(item.route)
      }, item.label)
    )
  );

  const outlet = el("main", { class: "outlet", id: "outlet" });

  app.append(topbar, nav, outlet);
  return { outlet, navButtons: nav.querySelectorAll(".nav__btn") };
}

function renderCurrencyDisplay() {
  const container = document.getElementById("currency-display");
  if (!container) return;
  const state = store.state;
  regenStamina(state);

  container.replaceChildren(
    el("div", { class: "currency currency--gems" }, [
      el("span", { class: "currency__dot" }), `${formatNumber(state.gems)} Gems`
    ]),
    el("div", { class: "currency currency--gold" }, [
      el("span", { class: "currency__dot" }), `${formatNumber(state.gold)} Gold`
    ]),
    el("div", { class: "currency currency--stamina" }, [
      el("span", { class: "currency__dot" }), `${state.stamina}/${getStaminaMax(state)} Stamina`
    ])
  );
}

function main() {
  const { outlet, navButtons } = buildShell();

  registerRoute("home", renderHome);
  registerRoute("pull", renderPull);
  registerRoute("roster", renderRoster);
  registerRoute("character", renderCharacterDetail);
  registerRoute("team", renderTeamBuilder);
  registerRoute("battle", (container, params) => {
    if (params.id) renderBattleStage(container, params.id);
    else renderBattleHub(container);
  });
  registerRoute("shop", renderShop);
  registerRoute("settings", renderSettings);

  store.onChange(renderCurrencyDisplay);
  renderCurrencyDisplay();

  startRouter({ outlet, navButtons, store });
}

main();
