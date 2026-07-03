import { GAME_DATA } from "../../data.js";
import { store } from "../state.js";
import { navigate } from "../router.js";
import { el, itemIcon } from "../utils.js";

let activeRarity = "all";
let activeClass = "all";

export function renderRoster(container) {
  const state = store.state;
  const ownedIds = new Set(Object.keys(state.characters));
  const classes = ["all", ...new Set(GAME_DATA.characters.map((c) => c.class))];
  const rarities = ["all", 5, 4, 3, 2, 1];

  const grid = el("div", { class: "grid" });

  function renderGrid() {
    grid.replaceChildren(
      ...GAME_DATA.characters
        .filter((c) => (activeRarity === "all" || c.rarity === activeRarity))
        .filter((c) => (activeClass === "all" || c.class === activeClass))
        .map((c) => {
          const owned = ownedIds.has(c.id);
          const level = owned ? state.characters[c.id].level : null;
          const card = el("button", {
            class: `item-card is-clickable ${owned ? "" : "is-locked"}`,
            onclick: () => (owned ? navigate("character", c.id) : null)
          }, [
            itemIcon({ image: c.image, name: c.name, rarity: c.rarity, level }),
            el("div", { class: "item-card__name" }, c.name),
            el("div", { class: "item-card__meta" }, owned ? c.class : "Not owned")
          ]);
          return card;
        })
    );
  }
  renderGrid();

  const rarityTabs = el("div", { class: "tabs" },
    rarities.map((r) =>
      el("button", {
        class: `tab ${activeRarity === r ? "is-active" : ""}`,
        onclick: () => { activeRarity = r; refreshTabs(); renderGrid(); }
      }, r === "all" ? "All Rarities" : `${r}★`)
    )
  );

  const classTabs = el("div", { class: "tabs" },
    classes.map((c) =>
      el("button", {
        class: `tab ${activeClass === c ? "is-active" : ""}`,
        onclick: () => { activeClass = c; refreshTabs(); renderGrid(); }
      }, c === "all" ? "All Classes" : c)
    )
  );

  function refreshTabs() {
    rarityTabs.querySelectorAll(".tab").forEach((btn, i) => btn.classList.toggle("is-active", rarities[i] === activeRarity));
    classTabs.querySelectorAll(".tab").forEach((btn, i) => btn.classList.toggle("is-active", classes[i] === activeClass));
  }

  container.append(
    el("div", { class: "screen" }, [
      el("div", { class: "screen__header" }, [
        el("h1", { class: "screen__title" }, "Roster"),
        el("p", { class: "screen__subtitle" }, `${ownedIds.size} / ${GAME_DATA.characters.length} characters collected`)
      ]),
      el("div", { class: "roster-filters" }, [rarityTabs, classTabs]),
      grid
    ])
  );
}
