// Pure auto-battle simulation. Turn order by SPD, energy-gated skills/ultimates,
// simplified buffs/debuffs/crowd-control. Produces a full log the UI plays back.

import { GAME_DATA } from "../data.js";
import { getCharacterDef, computeCharacterStats } from "./characters.js";
import { findById } from "./utils.js";

const AOE_EFFECT_TYPES = new Set(["damage_aoe", "damage_freeze", "damage_stun", "damage_confuse"]);
const ENERGY_PER_ACTION = 10;
export const MAX_ROUNDS = 30;
const FRONT_ROW_TARGET_WEIGHT = 2;
const BACK_ROW_TARGET_WEIGHT = 1;

// Heal moves only fire once the lowest-HP ally drops below these thresholds,
// scaled to how powerful (and how energy-gated) the heal is. Without this,
// free basic heals get spammed every turn and the whole party sits at max HP.
const BASIC_HEAL_HP_THRESHOLD = 0.6;
const SKILL_HEAL_HP_THRESHOLD = 0.5;
const ULTIMATE_HEAL_HP_THRESHOLD = 0.35;

let uid = 0;
const nextId = () => `c${++uid}`;

function scaleEnemyStats(baseStats, level) {
  const growth = 1 + (level - 1) * 0.12;
  return {
    hp: Math.round(baseStats.hp * growth),
    atk: Math.round(baseStats.atk * growth),
    def: Math.round(baseStats.def * growth),
    spd: baseStats.spd,
    critRate: baseStats.critRate,
    critDmg: baseStats.critDmg
  };
}

function makeCombatant({ side, refId, name, image, rarity, stats, skills, row }) {
  return {
    id: nextId(),
    side,
    refId,
    name,
    image: image ?? null,
    rarity: rarity ?? 1,
    row, // "front" | "back"
    maxHp: stats.hp,
    hp: stats.hp,
    baseStats: stats,
    skills: skills ?? [{ name: "Attack", type: "basic", cost: 0, effect: { type: "damage", multiplier: 1.0 } }],
    energy: 0,
    modifiers: [], // { stat, percent, duration, positive }
    stunnedTurns: 0,
    alive: true
  };
}

function buildPlayerTeam(state, teamIds) {
  return teamIds
    .map((charId, index) => {
      if (!charId) return null;
      const def = getCharacterDef(charId);
      const stats = computeCharacterStats(state, charId);
      if (!def || !stats) return null;
      return makeCombatant({
        side: "player",
        refId: charId,
        name: def.name,
        image: def.image,
        rarity: def.rarity,
        stats,
        skills: def.skills,
        row: index < 2 ? "front" : "back"
      });
    })
    .filter(Boolean);
}

function buildEnemyTeam(stage) {
  return stage.enemies.map((spec, index) => {
    const template = GAME_DATA.enemyTemplates[spec.template];
    const stats = scaleEnemyStats(template.baseStats, spec.level);
    return makeCombatant({
      side: "enemy",
      refId: spec.template,
      name: template.name,
      image: null,
      rarity: template.type === "Boss" ? 5 : template.type === "Elite" ? 3 : 1,
      stats,
      skills: [{ name: "Strike", type: "basic", cost: 0, effect: { type: "damage", multiplier: 1.0 } }],
      row: index === 0 ? "front" : "back"
    });
  });
}

function effectiveStat(c, statName) {
  const base = c.baseStats[statName];
  const percentTotal = c.modifiers
    .filter((m) => m.stat === statName)
    .reduce((sum, m) => sum + m.percent, 0);
  return Math.max(0, base * (1 + percentTotal / 100));
}

function tickModifiers(c) {
  c.modifiers = c.modifiers.filter((m) => --m.duration > 0);
}

function addModifier(c, stat, percent, duration, positive = percent >= 0) {
  c.modifiers.push({ stat, percent, duration: duration + 1, positive });
}

function aliveOf(list) {
  return list.filter((c) => c.alive);
}

function pickTarget(enemies, taunt) {
  const pool = aliveOf(enemies);
  if (pool.length === 0) return null;
  if (taunt) {
    const forced = pool.find((c) => c.id === taunt.targetId);
    if (forced) return forced;
  }
  const weighted = pool.flatMap((c) =>
    Array(c.row === "front" ? FRONT_ROW_TARGET_WEIGHT : BACK_ROW_TARGET_WEIGHT).fill(c)
  );
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function lowestHpAlly(allies) {
  return aliveOf(allies).reduce((lowest, c) => (!lowest || c.hp / c.maxHp < lowest.hp / lowest.maxHp ? c : lowest), null);
}

function isHealMove(skill) {
  const type = skill.effect.type
  return type === "heal"
    || type === "heal_buff_self_def"
    || type === "heal_all_regen"
    || type === "heal_all_damage_aoe"
    || skill.effect.healMultiplier != null
}

function needsHeal(allies, threshold) {
  const lowest = lowestHpAlly(allies);
  return lowest != null && lowest.hp / lowest.maxHp < threshold;
}

function dealDamage(log, attacker, target, multiplier) {
  const atk = effectiveStat(attacker, "atk");
  const def = effectiveStat(target, "def");
  const mitigation = def / (def + 100);
  let dmg = atk * multiplier * (1 - mitigation);

  const critRate = attacker.baseStats.critRate + attacker.modifiers.filter((m) => m.stat === "critRate").reduce((s, m) => s + m.percent, 0);
  const isCrit = Math.random() * 100 < critRate;
  if (isCrit) dmg *= attacker.baseStats.critDmg / 100;

  dmg = Math.max(1, Math.round(dmg));
  target.hp = Math.max(0, target.hp - dmg);

  log.push({
    type: "damage",
    actor: attacker.name,
    actorId: attacker.id,
    actorSide: attacker.side,
    target: target.name,
    targetId: target.id,
    amount: dmg,
    isCrit,
    message: `${attacker.name} hits ${target.name} for ${dmg}${isCrit ? " (Critical!)" : ""}.`
  });

  if (target.hp <= 0 && target.alive) {
    target.alive = false;
    log.push({ type: "defeat", target: target.name, targetId: target.id, message: `${target.name} is defeated!` });
  }
  return dmg;
}

function healTarget(log, healer, target, amount) {
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + amount);
  const healed = target.hp - before;
  log.push({
    type: "heal",
    actor: healer.name,
    actorId: healer.id,
    target: target.name,
    targetId: target.id,
    amount: healed,
    message: `${healer.name} heals ${target.name} for ${healed}.`
  });
}

function chooseSkill(c, allies) {
  const ultimate = c.skills.find((s) => s.type === "ultimate");
  const skill = c.skills.find((s) => s.type === "skill");
  const basic = c.skills.find((s) => s.type === "basic") ?? c.skills[0];

  if (ultimate && c.energy >= 100 && (!isHealMove(ultimate) || needsHeal(allies, ULTIMATE_HEAL_HP_THRESHOLD))) return ultimate;
  if (skill && c.energy >= skill.cost && Math.random() < 0.55 && (!isHealMove(skill) || needsHeal(allies, SKILL_HEAL_HP_THRESHOLD))) return skill;
  if (isHealMove(basic) && !needsHeal(allies, BASIC_HEAL_HP_THRESHOLD)) return null;
  return basic;
}

function resolveEffect(log, actor, use, allies, enemies, tauntState) {
  const { effect, type: skillType, name: skillName } = use;
  const isAoe = AOE_EFFECT_TYPES.has(effect.type);

  log.push({
    type: skillType === "ultimate" ? "ultimate" : "action",
    actor: actor.name,
    actorId: actor.id,
    message: `${actor.name} uses ${skillName}!`
  });

  if (effect.multiplier != null && effect.type !== "heal") {
    const targets = isAoe ? aliveOf(enemies) : [pickTarget(enemies, tauntState[actor.side])].filter(Boolean);
    for (const target of targets) {
      if (!target.alive) continue;
      let mult = effect.multiplier;
      if (effect.type === "conditional_damage" && target.modifiers.some((m) => m.positive)) {
        mult = effect.buffMultiplier ?? mult;
      }
      dealDamage(log, actor, target, mult);
      if (!target.alive) continue;

      if (effect.debuff) {
        addModifier(target, effect.debuff.stat, -effect.debuff.percent * 100, effect.debuff.duration, false);
        log.push({ type: "info", message: `${target.name}'s ${effect.debuff.stat.toUpperCase()} is lowered.` });
      }
      if (effect.removeBuff) {
        target.modifiers = target.modifiers.filter((m) => !m.positive);
      }
      if (effect.stunChance && Math.random() < effect.stunChance) {
        target.stunnedTurns += effect.stunDuration ?? 1;
        log.push({ type: "info", message: `${target.name} is stunned!` });
      }
      if (effect.confuseChance && Math.random() < effect.confuseChance) {
        target.stunnedTurns += effect.confuseDuration ?? 1;
        log.push({ type: "info", message: `${target.name} is confused!` });
      }
      if (effect.freezeDuration) {
        target.stunnedTurns += effect.freezeDuration;
        log.push({ type: "info", message: `${target.name} is frozen solid!` });
      }
    }

    if (effect.healPercent) {
      healTarget(log, actor, actor, Math.round(actor.maxHp * effect.healPercent));
    }
    if (effect.lifesteal) {
      healTarget(log, actor, actor, Math.round(dmg * effect.lifesteal));
    }
    if (effect.buffSpd) {
      addModifier(actor, "spd", effect.buffSpd, effect.duration ?? 2, true);
    }
  }

  if (effect.type === "heal") {
    const target = lowestHpAlly(allies);
    if (target) healTarget(log, actor, target, Math.round(effectiveStat(actor, "atk") * effect.multiplier * 2));
  }

  if (effect.healMultiplier) {
    for (const ally of aliveOf(allies)) {
      healTarget(log, actor, ally, Math.round(ally.maxHp * effect.healMultiplier));
    }
    if (effect.buffAtk) {
      for (const ally of aliveOf(allies)) addModifier(ally, "atk", effect.buffAtk * 100, effect.duration ?? 2, true);
    }
    if (effect.cleanse) {
      for (const ally of aliveOf(allies)) ally.modifiers = ally.modifiers.filter((m) => m.positive);
    }
    if (effect.damageMultiplier) {
      for (const enemy of aliveOf(enemies)) {
        if (!enemy.alive) continue
        dealDamage(log, actor, enemy, effect.damageMultiplier)
      }
    }
  }

  if (effect.type === "buff_self_def" || effect.type === "heal_buff_self_def") {
    if (effect.healPercent) {
      healTarget(log, actor, actor, Math.round(actor.maxHp * effect.healPercent))
    }
    const defVal = effect.defValue ?? effect.value
    if (defVal) {
      addModifier(actor, "def", defVal * 100, effect.duration, true)
      log.push({ type: "info", message: `${actor.name}'s defense rises sharply.` })
    }
    return
  }

  if (effect.type === "taunt") {
    addModifier(actor, "def", (effect.defMultiplier - 1) * 100, effect.duration, true);
    const enemySide = actor.side === "player" ? "enemy" : "player";
    tauntState[enemySide] = { targetId: actor.id, roundsLeft: effect.duration + 1 };
    log.push({ type: "info", message: `${actor.name} taunts the enemy team!` });
  }

  if (effect.type === "energy_restore_all") {
    for (const ally of aliveOf(allies)) {
      ally.energy = Math.min(100, ally.energy + effect.amount);
      log.push({ type: "energy", actorId: ally.id, energy: ally.energy });
    }
    log.push({ type: "info", message: `${actor.name} rallies the team, restoring energy!` });
  }
}

function takeTurn(actor, playerTeam, enemyTeam, log, tauntState) {
  if (!actor.alive) return;
  if (actor.stunnedTurns > 0) {
    actor.stunnedTurns -= 1;
    log.push({ type: "info", message: `${actor.name} is unable to act!` });
    return;
  }

  const allies = actor.side === "player" ? playerTeam : enemyTeam;
  const enemies = actor.side === "player" ? enemyTeam : playerTeam;
  const use = chooseSkill(actor, allies);

  if (!use) {
    log.push({ type: "info", message: `${actor.name} holds position — no one needs aid.` });
    return;
  }

  resolveEffect(log, actor, use, allies, enemies, tauntState);

  if (use.type === "ultimate") actor.energy = 0;
  else if (use.type === "skill") actor.energy = Math.max(0, actor.energy - use.cost + ENERGY_PER_ACTION);
  else actor.energy = Math.min(100, actor.energy + ENERGY_PER_ACTION);

  log.push({ type: "energy", actorId: actor.id, energy: actor.energy });
}

/**
 * Simulates a full auto-battle. Returns { victory, log, rounds, survivorsPlayer, survivorsEnemy }.
 */
export function simulateBattle(state, teamIds, stage) {
  const playerTeam = buildPlayerTeam(state, teamIds);
  const enemyTeam = buildEnemyTeam(stage);
  const log = [{ type: "info", message: "Battle start!" }];
  const tauntState = {};

  let round = 1;
  while (round <= MAX_ROUNDS && aliveOf(playerTeam).length && aliveOf(enemyTeam).length) {
    log.push({ type: "round", round, message: `— Round ${round} —` });
    const order = [...playerTeam, ...enemyTeam]
      .filter((c) => c.alive)
      .sort((a, b) => effectiveStat(b, "spd") - effectiveStat(a, "spd"));

    for (const actor of order) {
      if (!aliveOf(playerTeam).length || !aliveOf(enemyTeam).length) break;
      takeTurn(actor, playerTeam, enemyTeam, log, tauntState);
    }

    for (const c of [...playerTeam, ...enemyTeam]) tickModifiers(c);
    for (const side of Object.keys(tauntState)) {
      if (--tauntState[side].roundsLeft <= 0) delete tauntState[side];
    }
    round += 1;
  }

  const victory = aliveOf(enemyTeam).length === 0 && aliveOf(playerTeam).length > 0;
  const timedOut = !victory && aliveOf(playerTeam).length > 0 && aliveOf(enemyTeam).length > 0;
  log.push({ type: "info", message: victory ? "Victory!" : timedOut ? "Time's up..." : "Defeat..." });

  const snapshot = (c) => ({ id: c.id, side: c.side, name: c.name, image: c.image, rarity: c.rarity, maxHp: c.maxHp });
  return {
    victory,
    timedOut,
    log,
    rounds: round - 1,
    combatants: [...playerTeam, ...enemyTeam].map(snapshot)
  };
}

export function getStageById(stageId) {
  for (const area of GAME_DATA.areas) {
    const stage = findById(area.stages, stageId);
    if (stage) return { area, stage };
  }
  return null;
}
