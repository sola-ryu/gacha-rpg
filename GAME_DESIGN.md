# Gacha RPG — Game Design Document (Draft)

> A simple gacha web game with team building, battles, and collectibles. All assets generated via ComfyUI anime workflow.

---

## 1. Concept

A lightweight browser-based gacha game where you pull characters, outfits, and resources, build a team, and send them into battles against enemies. Think *Arknights* meets *Genshin* at a snackable scale — no gacha monetization needed (this is a personal project), but the core loop feels authentic.

**Tone:** Stylized anime with a touch of irreverence. Characters have personality, not just stats.

---

## 2. Core Loop

```
Pull → Build Team → Battle → Earn Rewards → Pull again
```

1. **Pull** — Spend gems to summon characters, outfits, or leveling items from various banners.
2. **Build Team** — Assign characters to your active roster, equip outfits, level them up.
3. **Battle** — Send your team into stages/levels against enemies. Win to earn gems and resources.
4. **Repeat** — New banners, harder stages, collect everything.

---

## 3. Pull System (Gacha Mechanics)

### Currencies

| Currency | Earned From | Used For |
|----------|-------------|----------|
| Gems | Battle rewards, daily login, free pack cooldown | Pulling characters/items |
| Gold | Battle rewards, selling duplicates | Leveling items, outfit upgrades |
| Stamina | Regenerates over time (1 per 30 min) | Entering battle stages |

### Banner Types

1. **Standard Banner** — Always available. Contains base roster of characters + common outfits.
2. **Limited Banner** — Rotating pool with featured character(s). Higher rate-up on specific units. Expires after a set period.
3. **Item Banner** — Pulls for leveling items, outfit upgrade materials, etc.

### Rarity Tiers

| Tier | Color | Drop Rate | Notes |
|------|-------|-----------|-------|
| Common (★) | Gray | ~50% | Leveling items, basic outfits, filler characters |
| Uncommon (★★) | Green | ~30% | Decent characters, useful outfits |
| Rare (★★★) | Blue | ~14% | Solid units, good outfits |
| Epic (★★★★) | Purple | ~5% | Strong characters, premium outfits |
| Legendary (★★★★★) | Gold | ~1% | Top-tier characters, exclusive outfits |

### Pity System

- **Soft pity** starts at pull 75 — rate increases gradually.
- **Hard pity** at pull 90 — guaranteed Epic or higher.
- **Character guarantee** — If a Legendary is pulled but not the rate-up unit, next ★★★★★ is guaranteed to be the featured character.
- **Duplicate handling** — First copy = full character. Subsequent copies = "shards" that convert to Gold:
  - ★★ and ★★★ duplicates: 50 Gold each
  - ★★★★ duplicates: 300 Gold each
  - ★★★★★ duplicates: 1,000 Gold each

### Pull Costs

| Pull Type | Cost | Notes |
|-----------|------|-------|
| Single pull | 160 gems | Standard cost |
| 10-pull | 1500 gems (~13% discount) | Guaranteed at least one Rare+ |
| Free pack | 0 gems | 1/day, 3s cooldown between uses |
| Daily login reward | Free | Scales with streak: gems, stamina keys, materials |
| Paid pack (placeholder) | Real money / promo codes | For future expansion |

---

## 4. Characters

### Stats

Each character has:
- **HP** — Health pool
- **ATK** — Attack power
- **DEF** — Damage reduction
- **SPD** — Speed (determines turn order in battles)
- **Crit Rate / Crit DMG** — Critical hit chance and multiplier

### Classes

| Class | Role | Playstyle |
|-------|------|-----------|
| **Fighter** | Frontline damage | High ATK, moderate HP/DEF |
| **Tank** | Damage sponge | High HP/DEF, low ATK |
| **Mage** | Burst damage | High ATK, low HP/DEF |
| **Healer** | Support | Restores team HP, buffs allies |
| **Assassin** | Speed striker | High SPD/Crit, glass cannon |

### Skills (per character)

- **Basic Attack** — Spammable, low cost.
- **Skill** — Costs energy, moderate effect. Unlocked at a certain level.
- **Ultimate** — Costs full energy bar, powerful effect. Cooldown-based or energy-gated.

### Launch Roster — 8 Characters

| Name | Rarity | Class | Theme |
|------|--------|-------|-------|
| **Kira** | ★★★★★ | Fighter | Blade dancer with ribbon motifs, charismatic leader |
| **Ren** | ★★★★ | Tank | Armored knight, stoic but secretly soft |
| **Luna** | ★★★★ | Mage | Ice sorceress, elegant but aloof |
| **Miko** | ★★★ | Mage | Shrine maiden who channels spirits, deadpan humor |
| **Suki** | ★★★ | Healer | Chef whose food heals (and buffs), cheerful |
| **Bolt** | ★★★ | Fighter | Thunder-wielding warrior, hot-headed rival type |
| **Jax** | ★★ | Assassin | Street brawler, cocky attitude |
| **Pip** | ★ | Common | Support unit, comic relief, unexpectedly useful |

---

## 5. Outfits

Outfits provide stat bonuses only — no sprite swaps for now. Each outfit has its own image.

| Slot | Examples | Rarity Range |
|------|----------|-------------|
| **Main Outfit** | Alternate costumes | Common → Legendary |
| **Weapon** | Swords, staves, guns, books | Uncommon → Epic |
| **Accessory** | Rings, amulets, glasses | Common → Rare |

### Outfit Bonuses

- Flat stat boosts (e.g., +15% ATK)
- Passive effects (e.g., "Heals 3 HP at start of each turn")
- Set bonuses — wearing multiple pieces from the same set unlocks additional effects

### Acquiring Outfits

- Pulls from character-specific banners
- Shop purchases with Gold or gems
- Battle rewards / achievement unlocks

---

## 6. Leveling Items (Materials)

| Item | Purpose | Rarity |
|------|---------|--------|
| **Experience Books** | Level up characters | Common → Rare |
| **Awakening Stones** | Unlock skill tiers / stat caps | Uncommon → Epic |
| **Upgrade Cores** | Enhance weapon slots | Common → Rare |
| **Fragment Shards** | Merge duplicates for Gold | Common |

---

## 7. Battle System

### Format — Pure Auto-Battle

Player selects team composition and equipment before entering. Battles play out automatically with visual feedback. No player intervention during combat.

### Stage Structure

- **Stages** are grouped into **Areas** (like chapters/regions).
- Each area has 3-5 stages of increasing difficulty.
- Clearing a stage unlocks the next area.
- Boss stages at the end of each area.

### Battle Mechanics (Pure Auto)

```
Turn order determined by SPD stat → highest goes first

Each turn:
1. Character acts (basic attack or skill — auto-selected)
2. Apply damage, healing, buffs/debuffs
3. Check for death/defeat conditions
4. If team alive → advance to next enemy wave
5. If all dead → stage failed
```

### Enemy Types

| Type | Behavior |
|------|----------|
| **Grunt** | Basic attacks, low stats |
| **Elite** | Has a special attack pattern |
| **Boss** | Multi-phase, unique mechanics |

### Battle Rewards

- Gems (scales with difficulty)
- Gold
- Materials (random drop pool per stage)
- Achievement points

### Daily Login Rewards

| Streak | Reward |
|--------|--------|
| Day 1-3 | 50 gems each |
| Day 4 | 1 Stamina Key |
| Day 5-6 | 50 gems each |
| Day 7 | 200 gems + 1 Stamina Key |
| Reset on miss | Back to Day 1 |

### Stamina Tiers

- **Base max:** 20 stamina
- Scales as you unlock characters (+2 max per new character unlocked)
- **Stamina Keys** — Premium currency to unlock higher tiers:
  - Each key unlocks +5 max stamina, up to a cap (e.g., 50 max)
  - Earned from daily login rewards and milestone achievements
  - Optional real-money purchase packs (future)

---

## 8. Team Building

- **Active roster:** 5 characters max.
- **Reserve roster:** Unlimited (stored but not in active team).
- **Formation slot selection:** Drag-and-drop UI to arrange characters in the active team. Position affects targeting priority (front row takes more damage, back row is safer).

### Team Synergy

- Certain character combinations unlock passive "bond" bonuses when placed together.
- Example: Kira + Ren → "Blade & Shield" (+10% DEF to both)

---

## 9. Progression

### Short-term (session)
- Clear stages → earn gems → pull more → build stronger team → tackle harder stages

### Medium-term (days/weeks)
- Complete an area → unlock new area with new characters
- Limited banner rotations
- Achievement milestones

### Long-term (months)
- Collect all characters and outfits
- Beat hardest content
- New banner cycles / seasonal events

---

## 10. UI / Screens

| Screen | Purpose |
|--------|---------|
| **Home** | Hub — shows gems, stamina, daily login bonus, navigation to other screens |
| **Pull Screen** | Banner display with animated card-opening sequence |
| **Roster** | View all collected characters, filter by rarity/class |
| **Character Detail** | Stats, skills, equipped outfit, leveling options |
| **Team Builder** | Drag-and-drop team composition screen |
| **Battle** | Stage selection → battle animation → results |
| **Shop** | Purchase outfits, materials, stamina refills |
| **Settings** | Sound, music, reset progress |

### Pull Animation (key detail)

- **Common/Rare:** Simple CSS card flip with rarity-colored border glow.
- **Epic:** Card flip + purple particle burst overlay.
- **Legendary:** Card flip + golden particle burst (canvas-based) + screen flash + dramatic reveal.
- Post-reveal shows all pulled items in a grid. Swipe to dismiss or view details.

---

## 11. Art & Asset Pipeline

### Generation Method

All images generated via **ComfyUI** using the anime workflow (`z_image_turbo.json` / AuraFlow).

### Asset Types

| Asset | Quantity Estimate | Style Notes |
|-------|-------------------|-------------|
| Character portraits (full body) | 30-50 base + variants | Anime style, consistent character art direction |
| Outfit sprites | ~40-60 | Same character, different clothing/accessories |
| Backgrounds | 8-12 per area | Stage environments, battle backdrops |
| Enemy sprites | 10-15 types | Grunts, elites, bosses |
| UI elements | Icons, borders, buttons | Rarity-colored frames, gem icons, etc. |
| VFX | Hit sparks, skill effects, pull animations | Overlay effects for battles and gacha |

### Naming Convention

```
characters/{name}_{rarity}.png
outfits/{character}_{outfit-name}_{rarity}.png
enemies/{type}_{tier}.png
bg/{area}-{stage}.png
ui/{element}.png
```

### Generation Prompts

Each asset needs a consistent style prompt prefix, e.g.:

> `anime style, clean line art, vibrant colors, full body character portrait, white background, --ar 3:4`

Character-specific prompts define appearance, outfit, pose, and expression.

---

## 12. Technical Approach

### Stack

- **Single-page app** — HTML/CSS/JS (like the previous gacha-cards project)
- **LocalStorage** for save data
- **ComfyUI** for asset generation (offline, local)
- No server needed — fully client-side

### Data Structure (JSON)

```json
{
  "characters": [
    {
      "id": "kira",
      "name": "Kira",
      "rarity": 5,
      "class": "Fighter",
      "baseStats": { "hp": 1200, "atk": 95, "def": 60, "spd": 88 },
      "skills": [/* ... */],
      "imagePath": "characters/kira_legendary.png"
    }
  ],
  "outfits": [/* ... */],
  "items": [/* ... */],
  "stages": [/* ... */]
}
```

### State (player save)

```json
{
  "gems": 2400,
  "gold": 15000,
  "inventory": { "characters": [...], "outfits": [...], "materials": {...} },
  "team": ["kira", "ren", "miko", "suki", "jax"],
  "stagesCleared": ["area1-stage3", "area2-stage1"],
  "pityCounter": 42,
  "guaranteedFeatured": false,
  "dailyLoginStreak": 7
}
```

---

## 13. Stretch Goals (post-launch)

- **Character dialogue** — Unlockable flavor text when certain characters are on the same team (solo, not PvP)
- **Sound effects** — Pull sounds, battle SFX, character voice lines (TTS?)
- **Export/Import save** — JSON backup/restore via copy-paste
- **More characters** — Expand roster beyond launch 8

---

## 14. Decisions Made

1. **Pull animation** — Canvas particles for higher-tier pulls (Epic/Legendary). Common/Rare/Epic get simple CSS reveal; Legendary gets a golden particle burst effect.
2. **Battle visual** — Basic sprite motion + text battle log (not full frame-by-frame animation). Sprites slide/pulse on hit, skills show brief flash effects.
3. **Daily login** — Confirmed. Rewards scale with streak length (gems, stamina keys, materials).
4. **Sell duplicates** — Confirmed. Duplicate pulls convert to Gold (standard sell value) plus a small bonus for higher-rarity duplicates.
5. **Stage count** — Defer; will design during implementation.

---

*Draft — 2026-07-02 | Subject to revision based on scope and interest.*
