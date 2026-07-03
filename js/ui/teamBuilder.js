import { GAME_DATA } from "../../data.js";
import { store, setTeamSlot, clearTeamSlot } from "../state.js";
import { getActiveBonds } from "../characters.js";
import { el, itemIcon, findById, toast } from "../utils.js";

export function renderTeamBuilder(container) {
  const state = store.state;
  const team = state.team;

  function charName(id) {
    return findById(GAME_DATA.characters, id)?.name ?? id;
  }

  function slotNode(index) {
    const charId = team[index];
    const def = charId ? findById(GAME_DATA.characters, charId) : null;

    const slot = el("div", {
      class: `team-slot ${def ? "is-filled" : ""}`,
      dataset: { slot: index }
    });

    if (def) {
      slot.append(
        itemIcon({ image: def.image, name: def.name, rarity: def.rarity, level: state.characters[charId].level }),
        el("button", {
          class: "team-slot__remove",
          onclick: (e) => {
            e.stopPropagation();
            store.update((s) => clearTeamSlot(s, index));
          }
        }, "✕")
      );
    } else {
      slot.append(el("span", { class: "team-slot__empty" }, "+"));
    }

    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("is-drag-over");
    });
    slot.addEventListener("dragleave", () => slot.classList.remove("is-drag-over"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("is-drag-over");
      const draggedId = e.dataTransfer.getData("text/plain");
      if (!draggedId) return;
      store.update((s) => setTeamSlot(s, index, draggedId));
    });

    return slot;
  }

  const frontRow = el("div", {}, [
    el("div", { class: "team-row-label" }, "Front Row (higher target priority)"),
    el("div", { class: "team-slots" }, [slotNode(0), slotNode(1)])
  ]);
  const backRow = el("div", { style: "margin-top:1rem" }, [
    el("div", { class: "team-row-label" }, "Back Row"),
    el("div", { class: "team-slots" }, [slotNode(2), slotNode(3), slotNode(4)])
  ]);

  const activeBondSet = new Map();
  for (const charId of team.filter(Boolean)) {
    for (const bond of getActiveBonds(charId, team)) {
      activeBondSet.set(`${charId}-${bond.name}`, { charId, bond });
    }
  }
  const bondSummary = el("div", { class: "panel team-bond-summary" }, [
    el("h3", {}, "Active Bonds"),
    activeBondSet.size === 0
      ? el("p", { class: "text-muted" }, "No bond bonuses active. Try placing characters with shared bonds together.")
      : el("ul", {}, Array.from(activeBondSet.values()).map(({ charId, bond }) =>
          el("li", { class: "bond-row is-active", style: "margin-bottom:6px" }, `${charName(charId)} · ${bond.name} — ${bond.desc}`)
        ))
  ]);

  const ownedIds = Object.keys(state.characters);
  const reserveGrid = el("div", { class: "reserve-grid" },
    ownedIds.map((charId) => {
      const def = findById(GAME_DATA.characters, charId);
      const inTeam = team.includes(charId);
      const card = el("div", {
        class: "item-card is-clickable",
        draggable: "true",
        onclick: () => {
          if (inTeam) {
            store.update((s) => { s.team = s.team.map((id) => (id === charId ? null : id)); });
            return;
          }
          const emptyIndex = team.findIndex((id) => id === null);
          if (emptyIndex === -1) {
            toast("Team is full. Remove a character first.", "error");
            return;
          }
          store.update((s) => setTeamSlot(s, emptyIndex, charId));
        }
      }, [
        itemIcon({ image: def.image, name: def.name, rarity: def.rarity, level: state.characters[charId].level, extraClass: inTeam ? "is-in-team" : "" }),
        el("div", { class: "item-card__name" }, def.name),
        el("div", { class: "item-card__meta" }, inTeam ? "In team" : def.class)
      ]);
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", charId);
      });
      return card;
    })
  );

  container.append(
    el("div", { class: "screen" }, [
      el("div", { class: "screen__header" }, [
        el("h1", { class: "screen__title" }, "Team Builder"),
        el("p", { class: "screen__subtitle" }, "Drag characters into slots, or click to add/remove. Front row takes more damage.")
      ]),
      frontRow,
      backRow,
      bondSummary,
      el("div", { class: "reserve-header" }, [
        el("h3", {}, "Reserve Roster"),
        el("span", { class: "text-muted" }, `${ownedIds.length} owned`)
      ]),
      reserveGrid
    ])
  );
}
