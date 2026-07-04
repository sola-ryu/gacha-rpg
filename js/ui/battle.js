import { GAME_DATA } from "../../data.js";
import { store, spendStamina, addCurrency, grantMaterial, markStageCleared, regenStamina, getStaminaMax } from "../state.js";
import { simulateBattle, getStageById, MAX_ROUNDS } from "../battle.js";
import { navigate } from "../router.js";
import { el, itemIcon, imageOrPlaceholder, findById, toast } from "../utils.js";

export function renderBattleHub(container) {
  const state = store.state;

  const areaBlocks = GAME_DATA.areas.map((area) =>
    el("section", { class: "area-block" }, [
      el("h2", { class: "area-block__title" }, area.name),
      el("p", { class: "area-block__desc" }, area.description),
      el("div", { class: "stage-grid" },
        area.stages.map((stage) => {
          const cleared = state.stagesCleared.includes(stage.id);
          return el("button", {
            class: `stage-card ${stage.boss ? "is-boss" : ""} ${cleared ? "is-cleared" : ""}`,
            onclick: () => navigate("battle", stage.id)
          }, [
            el("div", { class: "stage-card__name" }, `${stage.boss ? "👑 " : ""}${stage.name}`),
            el("div", { class: "stage-card__meta" }, [
              el("span", {}, `${stage.enemies.length} enem${stage.enemies.length === 1 ? "y" : "ies"}`),
              el("span", {}, `⚡ ${stage.staminaCost}`)
            ])
          ]);
        })
      )
    ])
  );

  container.append(el("div", { class: "screen" }, [
    el("div", { class: "screen__header" }, [
      el("h1", { class: "screen__title" }, "Battle"),
      el("p", { class: "screen__subtitle" }, "Clear stages to earn Gems, Gold, and materials.")
    ]),
    ...areaBlocks
  ]));
}

function rollRewards(rewardSpec) {
  const materials = [];
  for (const drop of rewardSpec.materials ?? []) {
    if (Math.random() < drop.chance) materials.push(drop.id);
  }
  return { gems: rewardSpec.gems, gold: rewardSpec.gold, materials };
}

export function renderBattleStage(container, stageId) {
  const found = getStageById(stageId);
  if (!found) {
    container.append(el("div", { class: "screen" }, [
      el("div", { class: "empty-state" }, [el("p", {}, "Stage not found."), el("button", { class: "btn btn-primary", onclick: () => navigate("battle") }, "Back")]
      )
    ]));
    return;
  }
  const { area, stage } = found;
  const state = store.state;
  regenStamina(state);

  const teamDefs = state.team.filter(Boolean).map((id) => findById(GAME_DATA.characters, id));
  const enemyPreview = stage.enemies.map((spec) => GAME_DATA.enemyTemplates[spec.template]);

  const screen = el("div", { class: "screen" });
  const header = el("div", { class: "screen__header" }, [
    el("button", { class: "btn btn-ghost btn-sm", onclick: () => navigate("battle") }, "← Back"),
    el("h1", { class: "screen__title", style: "margin-top:0.5rem" }, `${area.name} — ${stage.name}`),
    el("p", { class: "screen__subtitle" }, `Stamina cost: ${stage.staminaCost} · ${stage.enemies.length} enemies`)
  ]);

  const previewPanel = el("div", { class: "panel" }, [
    el("div", { class: "battle-teams" }, [
      el("div", { class: "combatant-list" }, [
        el("h4", {}, "Your Team"),
        teamDefs.length === 0
          ? el("p", { class: "text-muted" }, "No team assigned.")
          : el("div", { class: "grid" }, teamDefs.map((c) => itemIcon({ image: c.image, name: c.name, rarity: c.rarity })))
      ]),
      el("div", { class: "battle-vs" }, "VS"),
      el("div", { class: "combatant-list" }, [
        el("h4", {}, "Enemies"),
        el("div", { class: "grid" }, enemyPreview.map((e) => itemIcon({ image: null, name: e.name, rarity: e.type === "Boss" ? 5 : e.type === "Elite" ? 3 : 1 })))
      ])
    ]),
    el("button", {
      class: "btn btn-primary btn-block",
      style: "margin-top:1.25rem",
      onclick: () => beginBattle()
    }, "Start Battle")
  ]);

  screen.append(header, previewPanel);
  container.append(screen);

  function beginBattle() {
    if (teamDefs.length === 0) {
      toast("Assign a team before battling.", "error");
      return;
    }
    const currentMax = getStaminaMax(store.state);
    // store.update() dispatches a change event that makes the router re-render the
    // whole outlet synchronously, so `screen`/`previewPanel` above are stale the
    // instant this call returns. Re-query the live outlet afterward instead of
    // touching those closures — the same pattern pull.js uses for its overlay.
    const staminaOk = store.update((s) => spendStamina(s, stage.staminaCost));
    if (!staminaOk) {
      toast(`Not enough stamina (need ${stage.staminaCost}/${currentMax}).`, "error");
      return;
    }
    const result = simulateBattle(store.state, store.state.team, stage);
    const freshScreen = document.getElementById("outlet").querySelector(".screen");
    freshScreen.querySelector(".panel")?.remove();
    freshScreen.append(renderArena(result, stage));
  }
}

function renderArena(result, stage) {
  const hpById = new Map(result.combatants.map((c) => [c.id, c.maxHp]));
  const rowById = new Map();

  const playerList = el("div", { class: "combatant-list" });
  const enemyList = el("div", { class: "combatant-list" });
  for (const c of result.combatants) {
    const row = buildCombatantRow(c);
    rowById.set(c.id, row);
    (c.side === "player" ? playerList : enemyList).append(row);
  }

  const logPanel = el("div", { class: "battle-log" });
  const skipBtn = el("button", { class: "btn btn-ghost btn-sm", onclick: () => finishNow() }, "Skip Animation");
  const resultSlot = el("div", {});
  const roundCounter = el("div", { class: "battle-round-counter" }, `Round 1 / ${MAX_ROUNDS}`);

  const arena = el("div", { class: "battle-arena" }, [
    roundCounter,
    el("div", { class: "battle-teams" }, [
      playerList,
      el("div", { class: "battle-vs" }, "VS"),
      enemyList
    ]),
    logPanel,
    el("div", { style: "text-align:center; margin-top:0.75rem" }, skipBtn),
    resultSlot
  ]);

  let index = 0;
  let timer = null;

  function applyEntry(entry) {
    if (entry.actorId && rowById.has(entry.actorId)) {
      const row = rowById.get(entry.actorId);
      row.classList.add("is-acting");
      setTimeout(() => row.classList.remove("is-acting"), 350);
    }
    if (entry.type === "damage" || entry.type === "heal") {
      const current = hpById.get(entry.targetId);
      const combatant = result.combatants.find((c) => c.id === entry.targetId);
      if (current != null && combatant) {
        const next = entry.type === "damage"
          ? Math.max(0, current - entry.amount)
          : Math.min(combatant.maxHp, current + entry.amount);
        hpById.set(entry.targetId, next);
        updateCombatantRow(rowById.get(entry.targetId), next, combatant.maxHp);
        if (entry.type === "damage") {
          const row = rowById.get(entry.targetId);
          row.classList.add("is-hit");
          setTimeout(() => row.classList.remove("is-hit"), 320);
        }
      }
    }
    if (entry.type === "defeat" && rowById.has(entry.targetId)) {
      rowById.get(entry.targetId).classList.add("is-defeated");
    }
    if (entry.type === "energy" && rowById.has(entry.actorId)) {
      updateEnergyRow(rowById.get(entry.actorId), entry.energy);
    }
    if (entry.type === "round") {
      roundCounter.textContent = `Round ${entry.round} / ${MAX_ROUNDS}`;
      roundCounter.classList.toggle("is-warning", MAX_ROUNDS - entry.round <= 5);
    }

    const variant = entry.type === "damage" && entry.isCrit ? "crit"
      : entry.type === "heal" ? "heal"
      : entry.type === "defeat" ? "defeat"
      : entry.type === "ultimate" ? "ultimate"
      : "";
    if (entry.type !== "round") {
      logPanel.prepend(el("div", { class: `battle-log__entry ${variant ? `battle-log__entry--${variant}` : ""}` }, entry.message));
    }
  }

  function step() {
    if (index >= result.log.length) {
      finishNow();
      return;
    }
    applyEntry(result.log[index]);
    index += 1;
    timer = setTimeout(step, 260);
  }

  function finishNow() {
    clearTimeout(timer);
    while (index < result.log.length) {
      applyEntry(result.log[index]);
      index += 1;
    }
    skipBtn.remove();

    if (!result.victory) {
      resultSlot.append(buildDefeatResult(result));
      return;
    }

    const rewards = rollRewards(stage.rewards);
    // Same staleness hazard as beginBattle: this store.update() re-renders the
    // outlet, so grab a fresh screen reference afterward instead of using resultSlot.
    store.update((s) => {
      addCurrency(s, { gems: rewards.gems, gold: rewards.gold });
      for (const materialId of rewards.materials) grantMaterial(s, materialId, 1);
      markStageCleared(s, stage.id);
    });
    const freshScreen = document.getElementById("outlet").querySelector(".screen");
    freshScreen.querySelector(".panel")?.remove();
    freshScreen.append(buildVictoryResult(rewards, result, stage));
  }

  timer = setTimeout(step, 260);
  return arena;
}

function buildCombatantRow(c) {
  return el("div", { class: "combatant", dataset: { id: c.id } }, [
    el("div", { class: "combatant__portrait", style: `--rarity-glow: var(--rarity-${c.rarity})` }, imageOrPlaceholder(c.image, c.name)),
    el("div", { class: "combatant__body" }, [
      el("div", { class: "combatant__name-row" }, [
        el("span", { class: "combatant__name" }, c.name),
        el("span", {}, [
          el("span", { class: "hp-text" }, `${c.maxHp}/${c.maxHp}`),
          el("span", { class: "energy-text" }, ` EP ${c.energy}`)
        ])
      ]),
      el("div", { class: "combatant__bars" }, [
        el("div", { class: "progress" }, [el("div", { class: "progress__fill progress__fill--hp", style: "width:100%" })]),
        el("div", { class: "progress progress--energy" }, [el("div", { class: "progress__fill progress__fill--energy", style: "width:0%" })])
      ])
    ])
  ]);
}

function updateCombatantRow(row, hp, maxHp) {
  if (!row) return;
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  row.querySelector(".progress__fill--hp").style.width = `${pct}%`;
  row.querySelector(".hp-text").textContent = `${hp}/${maxHp}`;
}

function updateEnergyRow(row, energy) {
  if (!row) return;
  const pct = Math.max(0, Math.min(100, energy));
  row.querySelector(".progress__fill--energy").style.width = `${pct}%`;
  row.querySelector(".energy-text").textContent = ` EP ${energy}`;
}

function buildDefeatResult(result) {
  const title = result.timedOut ? "Time's Up..." : "Defeat...";
  const desc = result.timedOut
    ? `The battle dragged on past the ${MAX_ROUNDS}-round limit with the enemy still standing. Your team survived, but couldn't finish the fight in time — you'll need more damage output, not more healing.`
    : "Your team was overwhelmed. Level up and try again.";
  return el("div", { class: "battle-result" }, [
    el("div", { class: "battle-result__title is-defeat" }, title),
    el("p", { class: "text-muted" }, desc),
    el("button", { class: "btn btn-primary", onclick: () => navigate("battle") }, "Back to Stage Select")
  ]);
}

function buildVictoryResult(rewards, result, stage) {
  const materialDefs = rewards.materials.map((id) => findById(GAME_DATA.materials, id));

  return el("div", { class: "battle-result" }, [
    el("div", { class: "battle-result__title is-victory" }, "Victory!"),
    el("p", { class: "text-muted" }, `Cleared in ${result.rounds} rounds.`),
    el("div", { class: "battle-result__rewards" }, [
      el("span", { class: "badge badge--rarity-3" }, `+${rewards.gems} Gems`),
      el("span", { class: "badge badge--rarity-5" }, `+${rewards.gold} Gold`),
      ...materialDefs.map((m) => el("span", { class: "badge" }, `+1 ${m.name}`))
    ]),
    el("div", { style: "display:flex; gap:0.5rem; justify-content:center" }, [
      el("button", { class: "btn btn-ghost", onclick: () => navigate("battle") }, "Stage Select"),
      el("button", { class: "btn btn-primary", onclick: () => navigate("battle", stage.id) }, "Replay Stage")
    ])
  ]);
}
