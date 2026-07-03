// Gacha RPG — Game Data
// Launch roster: 8 characters, each with outfits, weapons, accessories

export const GAME_DATA = {
  // =========================================================================
  // CHARACTERS
  // =========================================================================
  characters: [
    {
      id: "kira",
      name: "Kira",
      rarity: 5,
      class: "Fighter",
      description:
        "Blade dancer with ribbon motifs. Charismatic leader who fights with grace and fire.",
      image: "assets/character/kira/comfy-cli_01626_.png",
      baseStats: {
        hp: 1200,
        atk: 95,
        def: 60,
        spd: 88,
        critRate: 15,
        critDmg: 150,
      },
      growth: {
        hpPerLevel: 45,
        atkPerLevel: 8,
        defPerLevel: 5,
        spdPerLevel: 2,
      },
      skills: [
        {
          name: "Ribbon Slash",
          type: "basic",
          cost: 0,
          desc: "Basic blade strike. Deals ATK damage.",
          effect: { type: "damage", multiplier: 1.0 },
        },
        {
          name: "Dance of Flames",
          type: "skill",
          cost: 30,
          desc: "Channels fire into her blades. Deals ATK × 1.8 damage to a single target.",
          effect: { type: "damage", multiplier: 1.8 },
        },
        {
          name: "Blade of the Sun",
          type: "ultimate",
          cost: 100,
          desc: "Ultimate technique. Deals ATK × 3.0 damage and heals self for 15% max HP.",
          effect: { type: "damage_heal", multiplier: 3.0, healPercent: 0.15 },
        },
      ],
      bondBonuses: [
        { with: "ren", name: "Blade & Shield", desc: "+10% DEF to both" },
        { with: "bolt", name: "Rival Sparks", desc: "+8% ATK to both" },
      ],
    },
    {
      id: "ren",
      name: "Ren",
      rarity: 4,
      class: "Tank",
      description:
        "Armored knight, stoic but secretly soft. The unshakeable wall of the team.",
      image: "assets/character/ren/comfy-cli_01623_.png",
      baseStats: {
        hp: 1800,
        atk: 55,
        def: 120,
        spd: 50,
        critRate: 5,
        critDmg: 130,
      },
      growth: {
        hpPerLevel: 70,
        atkPerLevel: 4,
        defPerLevel: 8,
        spdPerLevel: 1,
      },
      skills: [
        {
          name: "Shield Bash",
          type: "basic",
          cost: 0,
          desc: "Basic shield strike. Deals ATK damage and reduces target DEF by 10% for 2 turns.",
          effect: {
            type: "damage_debuff",
            multiplier: 1.0,
            debuff: { stat: "def", percent: 0.1, duration: 2 },
          },
        },
        {
          name: "Iron Wall",
          type: "skill",
          cost: 35,
          desc: "Raises DEF by 30% for 3 turns.",
          effect: { type: "buff_self_def", value: 0.3, duration: 3 },
        },
        {
          name: "Unbreakable Vow",
          type: "ultimate",
          cost: 100,
          desc: "Taunts all enemies to attack Ren for 2 turns. DEF × 2 during taunt.",
          effect: { type: "taunt", duration: 2, defMultiplier: 2.0 },
        },
      ],
      bondBonuses: [
        { with: "kira", name: "Blade & Shield", desc: "+10% DEF to both" },
        {
          with: "suki",
          name: "Knight's Ward",
          desc: "Ren taunt duration +1 turn",
        },
      ],
    },
    {
      id: "luna",
      name: "Luna",
      rarity: 4,
      class: "Mage",
      description:
        "Ice sorceress, elegant but aloof. Her frost can freeze enemies in their tracks.",
      image: "assets/character/luna/comfy-cli_01628_.png",
      baseStats: {
        hp: 800,
        atk: 130,
        def: 35,
        spd: 72,
        critRate: 20,
        critDmg: 160,
      },
      growth: {
        hpPerLevel: 30,
        atkPerLevel: 12,
        defPerLevel: 3,
        spdPerLevel: 2,
      },
      skills: [
        {
          name: "Frost Bolt",
          type: "basic",
          cost: 0,
          desc: "Basic ice projectile. Deals ATK damage.",
          effect: { type: "damage", multiplier: 1.0 },
        },
        {
          name: "Glacial Surge",
          type: "skill",
          cost: 30,
          desc: "Deals ATK × 2.0 damage to target and all adjacent enemies (AoE).",
          effect: { type: "damage_aoe", multiplier: 2.0 },
        },
        {
          name: "Absolute Zero",
          type: "ultimate",
          cost: 100,
          desc: "Freezes all enemies for 1 turn (skip their next turn). Deals ATK × 1.5 damage.",
          effect: { type: "damage_freeze", multiplier: 1.5, freezeDuration: 1 },
        },
      ],
      bondBonuses: [
        { with: "miko", name: "Spirit Frost", desc: "+15% ATK to Luna" },
        {
          with: "suki",
          name: "Warmth Against Cold",
          desc: "Luna heals 5 HP per turn when Suki is on team",
        },
      ],
    },
    {
      id: "miko",
      name: "Miko",
      rarity: 3,
      class: "Mage",
      description:
        "Shrine maiden who channels spirits. Deadpan humor that catches everyone off guard.",
      image: "assets/character/miko/comfy-cli_01629_.png",
      baseStats: {
        hp: 750,
        atk: 100,
        def: 30,
        spd: 68,
        critRate: 12,
        critDmg: 140,
      },
      growth: {
        hpPerLevel: 28,
        atkPerLevel: 9,
        defPerLevel: 3,
        spdPerLevel: 2,
      },
      skills: [
        {
          name: "Spirit Tap",
          type: "basic",
          cost: 0,
          desc: "Channels a spirit's energy. Deals ATK damage.",
          effect: { type: "damage", multiplier: 1.0 },
        },
        {
          name: "Exorcism Rite",
          type: "skill",
          cost: 25,
          desc: "Deals ATK × 1.6 damage and removes 1 buff from target.",
          effect: { type: "damage_debuff", multiplier: 1.6, removeBuff: true },
        },
        {
          name: "Spirit Realm",
          type: "ultimate",
          cost: 100,
          desc: "All spirits attack enemies. Deals ATK × 2.2 damage to all enemies.",
          effect: { type: "damage_aoe", multiplier: 2.2 },
        },
      ],
      bondBonuses: [
        { with: "luna", name: "Spirit Frost", desc: "+15% ATK to Luna" },
        { with: "pip", name: "Funny Duo", desc: "Both gain +5 SPD" },
      ],
    },
    {
      id: "suki",
      name: "Suki",
      rarity: 3,
      class: "Healer",
      description:
        "Chef whose food heals (and buffs). Cheerful and endlessly optimistic.",
      image: "assets/character/suki/comfy-cli_01630_.png",
      baseStats: {
        hp: 850,
        atk: 40,
        def: 40,
        spd: 60,
        critRate: 5,
        critDmg: 120,
      },
      growth: {
        hpPerLevel: 35,
        atkPerLevel: 3,
        defPerLevel: 4,
        spdPerLevel: 2,
      },
      skills: [
        {
          name: "Whisk of Light",
          type: "basic",
          cost: 0,
          desc: "Heals target ally for HP × 0.5.",
          effect: { type: "heal", multiplier: 0.5 },
        },
        {
          name: "Feast of Renewal",
          type: "skill",
          cost: 30,
          desc: "Heals all allies for HP × 0.8 and applies ATK +10% buff for 2 turns.",
          effect: {
            type: "heal_all_buff_atk",
            healMultiplier: 0.8,
            buffAtk: 0.1,
            duration: 2,
          },
        },
        {
          name: "Grand Banquet",
          type: "ultimate",
          cost: 100,
          desc: "Heals all allies for HP × 1.5 and removes all debuffs.",
          effect: {
            type: "heal_all_cleanse",
            healMultiplier: 1.5,
            cleanse: true,
          },
        },
      ],
      bondBonuses: [
        {
          with: "ren",
          name: "Knight's Ward",
          desc: "Ren taunt duration +1 turn",
        },
        {
          with: "luna",
          name: "Warmth Against Cold",
          desc: "Luna heals 5 HP per turn when Suki is on team",
        },
      ],
    },
    {
      id: "bolt",
      name: "Bolt",
      rarity: 3,
      class: "Fighter",
      description:
        "Thunder-wielding warrior. Hot-headed rival type who always wants to prove himself.",
      image: "assets/character/bolt/comfy-cli_01631_.png",
      baseStats: {
        hp: 1000,
        atk: 85,
        def: 50,
        spd: 82,
        critRate: 18,
        critDmg: 155,
      },
      growth: {
        hpPerLevel: 40,
        atkPerLevel: 7,
        defPerLevel: 4,
        spdPerLevel: 3,
      },
      skills: [
        {
          name: "Thunder Strike",
          type: "basic",
          cost: 0,
          desc: "Basic lightning-infused strike. Deals ATK damage.",
          effect: { type: "damage", multiplier: 1.0 },
        },
        {
          name: "Lightning Rush",
          type: "skill",
          cost: 25,
          desc: "Charges forward. Deals ATK × 1.7 damage and gains +15 SPD for 2 turns.",
          effect: {
            type: "damage_buff_spd",
            multiplier: 1.7,
            buffSpd: 15,
            duration: 2,
          },
        },
        {
          name: "Thunder God's Wrath",
          type: "ultimate",
          cost: 100,
          desc: "Strikes all enemies with lightning. Deals ATK × 2.0 damage. 20% chance to stun target for 1 turn.",
          effect: {
            type: "damage_stun",
            multiplier: 2.0,
            stunChance: 0.2,
            stunDuration: 1,
          },
        },
      ],
      bondBonuses: [
        { with: "kira", name: "Rival Sparks", desc: "+8% ATK to both" },
        {
          with: "jax",
          name: "Street Fight Club",
          desc: "Both gain +10% Crit Rate",
        },
      ],
    },
    {
      id: "jax",
      name: "Jax",
      rarity: 2,
      class: "Assassin",
      description:
        "Street brawler with cocky attitude. Fast, unpredictable, and surprisingly scrappy.",
      image: "assets/character/jax/comfy-cli_01624_.png",
      baseStats: {
        hp: 700,
        atk: 75,
        def: 25,
        spd: 100,
        critRate: 25,
        critDmg: 170,
      },
      growth: {
        hpPerLevel: 25,
        atkPerLevel: 6,
        defPerLevel: 2,
        spdPerLevel: 4,
      },
      skills: [
        {
          name: "Quick Jab",
          type: "basic",
          cost: 0,
          desc: "Fast punch. Deals ATK damage.",
          effect: { type: "damage", multiplier: 1.0 },
        },
        {
          name: "Backstab",
          type: "skill",
          cost: 25,
          desc: "Deals ATK × 2.0 damage. If target has a buff, deals × 2.5 instead.",
          effect: {
            type: "conditional_damage",
            multiplier: 2.0,
            buffMultiplier: 2.5,
          },
        },
        {
          name: "Street Fury",
          type: "ultimate",
          cost: 100,
          desc: "Unleashes a flurry of strikes. Deals ATK × 3.5 damage to a single target.",
          effect: { type: "damage", multiplier: 3.5 },
        },
      ],
      bondBonuses: [
        {
          with: "bolt",
          name: "Street Fight Club",
          desc: "Both gain +10% Crit Rate",
        },
        {
          with: "pip",
          name: "Underdog Alliance",
          desc: "Both gain +15% ATK when HP < 50%",
        },
      ],
    },
    {
      id: "pip",
      name: "Pip",
      rarity: 1,
      class: "Common",
      description:
        "Support unit and comic relief. Unexpectedly useful despite the silly appearance.",
      image: "assets/character/pip/comfy-cli_01625_.png",
      baseStats: {
        hp: 600,
        atk: 25,
        def: 20,
        spd: 55,
        critRate: 3,
        critDmg: 110,
      },
      growth: {
        hpPerLevel: 20,
        atkPerLevel: 2,
        defPerLevel: 2,
        spdPerLevel: 2,
      },
      skills: [
        {
          name: "Peck",
          type: "basic",
          cost: 0,
          desc: "Basic peck attack. Deals ATK damage.",
          effect: { type: "damage", multiplier: 1.0 },
        },
        {
          name: "Cheer",
          type: "skill",
          cost: 20,
          desc: "Cheers all allies. Restores 10 energy to each ally.",
          effect: { type: "energy_restore_all", amount: 10 },
        },
        {
          name: "Panic Charge",
          type: "ultimate",
          cost: 100,
          desc: "Charges wildly into enemies. Deals ATK × 1.5 damage to all enemies and confuses them (50% chance to miss next turn).",
          effect: {
            type: "damage_confuse",
            multiplier: 1.5,
            confuseChance: 0.5,
            confuseDuration: 1,
          },
        },
      ],
      bondBonuses: [
        { with: "miko", name: "Funny Duo", desc: "Both gain +5 SPD" },
        {
          with: "jax",
          name: "Underdog Alliance",
          desc: "Both gain +15% ATK when HP < 50%",
        },
      ],
    },
  ],

  // =========================================================================
  // OUTFITS (stat bonuses only, no sprite swaps — art not yet generated,
  // UI falls back to a rarity-colored placeholder when image is null)
  // =========================================================================
  outfits: [
    // Kira outfits
    {
      id: "kira_outfit_1",
      name: "Blade Dancer's Regalia",
      characterId: "kira",
      rarity: 5,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 15, spdPercent: 10 },
    },
    {
      id: "kira_outfit_2",
      name: "Sunfire Robes",
      characterId: "kira",
      rarity: 4,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 12, hpPercent: 5 },
    },
    // Ren outfits
    {
      id: "ren_outfit_1",
      name: "Knight's Full Plate",
      characterId: "ren",
      rarity: 5,
      slot: "main",
      image: null,
      bonuses: { defPercent: 20, hpPercent: 10 },
    },
    {
      id: "ren_outfit_2",
      name: "Light Armor Set",
      characterId: "ren",
      rarity: 3,
      slot: "main",
      image: null,
      bonuses: { defPercent: 10, spdPercent: 5 },
    },
    // Luna outfits
    {
      id: "luna_outfit_1",
      name: "Frostweave Gown",
      characterId: "luna",
      rarity: 5,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 18, hpPercent: 5 },
    },
    {
      id: "luna_outfit_2",
      name: "Ice Crystal Robes",
      characterId: "luna",
      rarity: 4,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 10, critRateFlat: 8 },
    },
    // Miko outfits
    {
      id: "miko_outfit_1",
      name: "Sacred Shrine Maiden Garb",
      characterId: "miko",
      rarity: 4,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 12, hpPercent: 8 },
    },
    {
      id: "miko_outfit_2",
      name: "Spirit Channeling Vestments",
      characterId: "miko",
      rarity: 3,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 8, spdPercent: 5 },
    },
    // Suki outfits
    {
      id: "suki_outfit_1",
      name: "Chef's Master Apron",
      characterId: "suki",
      rarity: 4,
      slot: "main",
      image: null,
      bonuses: { hpPercent: 15, atkPercent: 5 },
    },
    {
      id: "suki_outfit_2",
      name: "Grand Kitchen Robes",
      characterId: "suki",
      rarity: 3,
      slot: "main",
      image: null,
      bonuses: { hpPercent: 10, defPercent: 5 },
    },
    // Bolt outfits
    {
      id: "bolt_outfit_1",
      name: "Thunderforged Armor",
      characterId: "bolt",
      rarity: 4,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 12, spdPercent: 8 },
    },
    {
      id: "bolt_outfit_2",
      name: "Storm Rider Gear",
      characterId: "bolt",
      rarity: 3,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 8, hpPercent: 5 },
    },
    // Jax outfits
    {
      id: "jax_outfit_1",
      name: "Street Brawler Gear",
      characterId: "jax",
      rarity: 3,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 8, spdPercent: 10 },
    },
    {
      id: "jax_outfit_2",
      name: "Underground Fighter Outfit",
      characterId: "jax",
      rarity: 2,
      slot: "main",
      image: null,
      bonuses: { atkPercent: 5, critRateFlat: 5 },
    },
    // Pip outfits
    {
      id: "pip_outfit_1",
      name: "Little Champion Hood",
      characterId: "pip",
      rarity: 2,
      slot: "main",
      image: null,
      bonuses: { hpPercent: 10, spdPercent: 5 },
    },
    {
      id: "pip_outfit_2",
      name: "Festival Costume",
      characterId: "pip",
      rarity: 1,
      slot: "main",
      image: null,
      bonuses: { hpPercent: 5, atkPercent: 3 },
    },
  ],

  // =========================================================================
  // WEAPONS
  // =========================================================================
  weapons: [
    // Kira weapons
    {
      id: "kira_weapon_1",
      name: "Ribbon Blade",
      characterId: "kira",
      rarity: 5,
      image: "assets/weapon/fire-sword.png",
      bonuses: { atkPercent: 20, spdPercent: 5 },
    },
    {
      id: "kira_weapon_2",
      name: "Flame Dancer's Katana",
      characterId: "kira",
      rarity: 4,
      image: "assets/weapon/fire-sword-2.png",
      bonuses: { atkPercent: 15, critRateFlat: 5 },
    },
    // Ren weapons
    {
      id: "ren_weapon_1",
      name: "Oathkeeper Shield",
      characterId: "ren",
      rarity: 5,
      image: "assets/weapon/shield.png",
      bonuses: { defPercent: 20, hpPercent: 10 },
    },
    {
      id: "ren_weapon_2",
      name: "Iron Bastion Tower Shield",
      characterId: "ren",
      rarity: 4,
      image: "assets/weapon/shield-2.png",
      bonuses: { defPercent: 15, hpPercent: 8 },
    },
    // Luna weapons
    {
      id: "luna_weapon_1",
      name: "Frostheart Staff",
      characterId: "luna",
      rarity: 5,
      image: "assets/weapon/ice-spear.png",
      bonuses: { atkPercent: 20, hpPercent: 5 },
    },
    {
      id: "luna_weapon_2",
      name: "Glacial Rod",
      characterId: "luna",
      rarity: 4,
      image: "assets/weapon/ice-spear-2.png",
      bonuses: { atkPercent: 15, critRateFlat: 8 },
    },
    // Miko weapons
    {
      id: "miko_weapon_1",
      name: "Spirit Conductor's Staff",
      characterId: "miko",
      rarity: 4,
      image: "assets/weapon/glowing-wand.png",
      bonuses: { atkPercent: 15, hpPercent: 5 },
    },
    {
      id: "miko_weapon_2",
      name: "Exorcism Ocarina",
      characterId: "miko",
      rarity: 3,
      image: "assets/weapon/comfy-cli_01688_.png",
      bonuses: { atkPercent: 10, spdPercent: 5 },
    },
    // Suki weapons
    {
      id: "suki_weapon_1",
      name: "Healing Ladle of Life",
      characterId: "suki",
      rarity: 4,
      image: "assets/weapon/comfy-cli_01690_.png",
      bonuses: { hpPercent: 15, atkPercent: 5 },
    },
    {
      id: "suki_weapon_2",
      name: "Grand Chef's Wok",
      characterId: "suki",
      rarity: 3,
      image: "assets/weapon/comfy-cli_01691_.png",
      bonuses: { hpPercent: 10, defPercent: 5 },
    },
    // Bolt weapons
    {
      id: "bolt_weapon_1",
      name: "Thunderclap Gauntlets",
      characterId: "bolt",
      rarity: 4,
      image: "assets/weapon/lightning-gloves.png",
      bonuses: { atkPercent: 15, spdPercent: 8 },
    },
    {
      id: "bolt_weapon_2",
      name: "Stormbreaker Mace",
      characterId: "bolt",
      rarity: 3,
      image: "assets/weapon/thunder-hammer.png",
      bonuses: { atkPercent: 10, critRateFlat: 5 },
    },
    // Jax weapons
    {
      id: "jax_weapon_1",
      name: "Brass Knuckles of the Arena",
      characterId: "jax",
      rarity: 3,
      image: "assets/weapon/comfy-cli_01694_.png",
      bonuses: { atkPercent: 10, critRateFlat: 8 },
    },
    {
      id: "jax_weapon_2",
      name: "Chain Whip",
      characterId: "jax",
      rarity: 2,
      image: "assets/weapon/spike-chain.png",
      bonuses: { atkPercent: 7, spdPercent: 5 },
    },
    // Pip weapons
    {
      id: "pip_weapon_1",
      name: "Tiny Spear of Courage",
      characterId: "pip",
      rarity: 2,
      image: "assets/weapon/comfy-cli_01696_.png",
      bonuses: { atkPercent: 5, hpPercent: 5 },
    },
    {
      id: "pip_weapon_2",
      name: "Bread Mace",
      characterId: "pip",
      rarity: 1,
      image: "assets/weapon/comfy-cli_01697_.png",
      bonuses: { atkPercent: 3, hpPercent: 8 },
    },
  ],

  // =========================================================================
  // ACCESSORIES
  // =========================================================================
  accessories: [
    {
      id: "acc_1",
      name: "Amulet of Vitality",
      rarity: 3,
      image: "assets/accessories/green-heart-necklace.png",
      bonuses: { hpPercent: 15 },
    },
    {
      id: "acc_2",
      name: "Ring of Power",
      rarity: 3,
      image: "assets/accessories/blue-gem.png",
      bonuses: { atkPercent: 10 },
    },
    {
      id: "acc_3",
      name: "Gloves of Swiftness",
      rarity: 3,
      image: "assets/accessories/blue-glove.png",
      bonuses: { spdPercent: 12 },
    },
    {
      id: "acc_4",
      name: "Crystal Pendant",
      rarity: 4,
      image: "assets/accessories/rainbow-gem-necklace.png",
      bonuses: { hpPercent: 10, atkPercent: 8 },
    },
    {
      id: "acc_5",
      name: "Charm of Fortune",
      rarity: 2,
      image: "assets/accessories/gold-clover-pendant.png",
      bonuses: { critRateFlat: 5 },
    },
    {
      id: "acc_6",
      name: "Shield Talisman",
      rarity: 4,
      image: "assets/accessories/shield.png",
      bonuses: { defPercent: 12, hpPercent: 8 },
    },
    {
      id: "acc_7",
      name: "Feather of the Wind",
      rarity: 2,
      image: "assets/accessories/feather.png",
      bonuses: { spdPercent: 8 },
    },
    {
      id: "acc_8",
      name: "Gem of Clarity",
      rarity: 3,
      image: "assets/accessories/blue-gem-band.png",
      bonuses: { critRateFlat: 5, critDmgFlat: 10 },
    },
  ],

  // =========================================================================
  // LEVELING MATERIALS
  // =========================================================================
  materials: [
    {
      id: "exp_book_common",
      name: "Experience Book (Common)",
      rarity: 1,
      image: "assets/materials/book-brown.png",
      effect: { type: "exp", amount: 50 },
    },
    {
      id: "exp_book_uncommon",
      name: "Experience Book (Uncommon)",
      rarity: 2,
      image: "assets/materials/book-green.png",
      effect: { type: "exp", amount: 120 },
    },
    {
      id: "exp_book_rare",
      name: "Experience Book (Rare)",
      rarity: 3,
      image: "assets/materials/book-blue.png",
      effect: { type: "exp", amount: 300 },
    },
    {
      id: "awaken_stone_uncommon",
      name: "Awakening Stone (Uncommon)",
      rarity: 2,
      image: "assets/materials/gem-green.png",
      effect: { type: "awaken", amount: 1 },
    },
    {
      id: "awaken_stone_rare",
      name: "Awakening Stone (Rare)",
      rarity: 3,
      image: "assets/materials/gem-blue.png",
      effect: { type: "awaken", amount: 2 },
    },
    {
      id: "upgrade_core_common",
      name: "Upgrade Core (Common)",
      rarity: 1,
      image: "assets/materials/orb-steel.png",
      effect: { type: "upgrade", amount: 1 },
    },
    {
      id: "upgrade_core_rare",
      name: "Upgrade Core (Rare)",
      rarity: 3,
      image: "assets/materials/orb-gold.png",
      effect: { type: "upgrade", amount: 3 },
    },
    {
      id: "fragment_shard",
      name: "Fragment Shard",
      rarity: 1,
      image: "assets/materials/gem-purple.png",
      effect: { type: "gold", amount: 5 },
    },
  ],

  // =========================================================================
  // AREAS & STAGES (battle content)
  // =========================================================================
  areas: [
    {
      id: "area1",
      name: "Whispering Fields",
      description:
        "Grassy plains on the edge of town — a gentle start for new recruits.",
      stages: [
        {
          id: "area1-stage1",
          name: "Field Patrol",
          staminaCost: 6,
          enemies: [
            { template: "slime", level: 1 },
            { template: "slime", level: 1 },
          ],
          rewards: {
            gems: 30,
            gold: 200,
            materials: [{ id: "exp_book_common", chance: 0.6 }],
          },
        },
        {
          id: "area1-stage2",
          name: "Overgrown Path",
          staminaCost: 7,
          enemies: [
            { template: "slime", level: 2 },
            { template: "wolf", level: 2 },
          ],
          rewards: {
            gems: 35,
            gold: 250,
            materials: [
              { id: "exp_book_common", chance: 0.6 },
              { id: "upgrade_core_common", chance: 0.3 },
            ],
          },
        },
        {
          id: "area1-stage3",
          name: "Bandit Ambush",
          staminaCost: 8,
          enemies: [
            { template: "bandit", level: 3 },
            { template: "bandit", level: 3 },
            { template: "wolf", level: 2 },
          ],
          rewards: {
            gems: 40,
            gold: 300,
            materials: [{ id: "exp_book_uncommon", chance: 0.4 }],
          },
        },
        {
          id: "area1-stage4",
          name: "The Field Warden",
          staminaCost: 10,
          boss: true,
          enemies: [{ template: "warden", level: 5 }],
          rewards: {
            gems: 80,
            gold: 500,
            materials: [
              { id: "awaken_stone_uncommon", chance: 0.5 },
              { id: "exp_book_uncommon", chance: 0.8 },
            ],
          },
        },
      ],
    },
    {
      id: "area2",
      name: "Ember Hollow",
      description:
        "A scorched ravine where fire elementals stir beneath the ash.",
      stages: [
        {
          id: "area2-stage1",
          name: "Ashen Trail",
          staminaCost: 9,
          enemies: [
            { template: "cinder-imp", level: 6 },
            { template: "cinder-imp", level: 6 },
          ],
          rewards: {
            gems: 45,
            gold: 350,
            materials: [{ id: "exp_book_uncommon", chance: 0.6 }],
          },
        },
        {
          id: "area2-stage2",
          name: "Molten Crevasse",
          staminaCost: 10,
          enemies: [
            { template: "cinder-imp", level: 7 },
            { template: "rock-golem", level: 7 },
          ],
          rewards: {
            gems: 50,
            gold: 400,
            materials: [{ id: "upgrade_core_rare", chance: 0.3 }],
          },
        },
        {
          id: "area2-stage3",
          name: "Cult of Cinders",
          staminaCost: 11,
          enemies: [
            { template: "cinder-imp", level: 8 },
            { template: "cinder-imp", level: 8 },
            { template: "rock-golem", level: 8 },
          ],
          rewards: {
            gems: 55,
            gold: 450,
            materials: [{ id: "exp_book_rare", chance: 0.4 }],
          },
        },
        {
          id: "area2-stage4",
          name: "The Ember Wyrm",
          staminaCost: 14,
          boss: true,
          enemies: [{ template: "ember-wyrm", level: 10 }],
          rewards: {
            gems: 120,
            gold: 800,
            materials: [
              { id: "awaken_stone_rare", chance: 0.5 },
              { id: "exp_book_rare", chance: 0.8 },
            ],
          },
        },
      ],
    },
  ],

  // =========================================================================
  // ENEMY TEMPLATES
  // =========================================================================
  enemyTemplates: {
    slime: {
      name: "Slime",
      type: "Grunt",
      baseStats: {
        hp: 180,
        atk: 18,
        def: 8,
        spd: 40,
        critRate: 2,
        critDmg: 120,
      },
    },
    wolf: {
      name: "Wild Wolf",
      type: "Grunt",
      baseStats: {
        hp: 220,
        atk: 26,
        def: 10,
        spd: 60,
        critRate: 8,
        critDmg: 130,
      },
    },
    bandit: {
      name: "Bandit",
      type: "Elite",
      baseStats: {
        hp: 320,
        atk: 32,
        def: 16,
        spd: 55,
        critRate: 10,
        critDmg: 140,
      },
    },
    warden: {
      name: "Field Warden",
      type: "Boss",
      baseStats: {
        hp: 1600,
        atk: 60,
        def: 35,
        spd: 50,
        critRate: 12,
        critDmg: 150,
      },
    },
    "cinder-imp": {
      name: "Cinder Imp",
      type: "Grunt",
      baseStats: {
        hp: 260,
        atk: 38,
        def: 14,
        spd: 65,
        critRate: 10,
        critDmg: 135,
      },
    },
    "rock-golem": {
      name: "Rock Golem",
      type: "Elite",
      baseStats: {
        hp: 600,
        atk: 34,
        def: 40,
        spd: 30,
        critRate: 4,
        critDmg: 120,
      },
    },
    "ember-wyrm": {
      name: "Ember Wyrm",
      type: "Boss",
      baseStats: {
        hp: 3200,
        atk: 85,
        def: 45,
        spd: 58,
        critRate: 15,
        critDmg: 160,
      },
    },
  },
};
