import { useState, useEffect, useCallback } from 'react';
import { GameState, Weapon, Armor, Enemy, ChestReward, RelicItem, DailyReward, MenuSkill, AdventureSkill } from '../types/game';
import { generateWeapon, generateArmor, generateEnemy, getChestRarityWeights, generateRelicItem, calculateTotalResearchBonuses } from '../utils/gameUtils';
import { checkAchievements, initializeAchievements } from '../utils/achievements';
import { checkPlayerTags, initializePlayerTags } from '../utils/playerTags';
import AsyncStorage from '../utils/storage';

const STORAGE_KEY = 'hugoland-game-state';

const createInitialGameState = (): GameState => ({
  coins: 500, // Changed from 100 to 500
  gems: 0,
  shinyGems: 0,
  zone: 1,
  playerStats: {
    hp: 100,
    maxHp: 100,
    atk: 20,
    def: 10,
    baseAtk: 20,
    baseDef: 10,
    baseHp: 100,
  },
  inventory: {
    weapons: [],
    armor: [],
    relics: [],
    currentWeapon: null,
    currentArmor: null,
    equippedRelics: [],
  },
  currentEnemy: null,
  inCombat: false,
  combatLog: [],
  research: {
    level: 0,
    totalSpent: 0,
    availableUpgrades: ['atk', 'def', 'hp'],
  },
  isPremium: false,
  achievements: initializeAchievements(),
  collectionBook: {
    weapons: {},
    armor: {},
    totalWeaponsFound: 0,
    totalArmorFound: 0,
    rarityStats: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythical: 0,
    },
  },
  knowledgeStreak: {
    current: 0,
    best: 0,
    multiplier: 1,
  },
  gameMode: {
    current: 'normal',
    speedModeActive: false,
    survivalLives: 3,
    maxSurvivalLives: 3,
  },
  statistics: {
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    totalPlayTime: 0,
    zonesReached: 1,
    itemsCollected: 0,
    coinsEarned: 0,
    gemsEarned: 0,
    shinyGemsEarned: 0,
    chestsOpened: 0,
    accuracyByCategory: {},
    sessionStartTime: new Date(),
    totalDeaths: 0,
    totalVictories: 0,
    longestStreak: 0,
    fastestVictory: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    itemsUpgraded: 0,
    itemsSold: 0,
    totalResearchSpent: 0,
    averageAccuracy: 0,
    revivals: 0,
  },
  cheats: {
    infiniteCoins: false,
    infiniteGems: false,
    obtainAnyItem: false,
  },
  mining: {
    totalGemsMined: 0,
    totalShinyGemsMined: 0,
  },
  yojefMarket: {
    items: [],
    lastRefresh: new Date(),
    nextRefresh: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  },
  playerTags: initializePlayerTags(),
  dailyRewards: {
    lastClaimDate: null,
    currentStreak: 0,
    maxStreak: 0,
    availableReward: null,
    rewardHistory: [],
  },
  progression: {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    skillPoints: 0,
    unlockedSkills: [],
    prestigeLevel: 0,
    prestigePoints: 0,
    masteryLevels: {},
  },
  offlineProgress: {
    lastSaveTime: new Date(),
    offlineCoins: 0,
    offlineGems: 0,
    offlineTime: 0,
    maxOfflineHours: 8,
  },
  gardenOfGrowth: {
    isPlanted: false,
    plantedAt: null,
    lastWatered: null,
    waterHoursRemaining: 0,
    growthCm: 0,
    totalGrowthBonus: 0,
    seedCost: 1000,
    waterCost: 500,
    maxGrowthCm: 100,
  },
  settings: {
    colorblindMode: false,
    darkMode: true,
    language: 'en',
    notifications: true,
    snapToGrid: false,
    beautyMode: false,
  },
  hasUsedRevival: false,
  skills: {
    activeMenuSkill: null,
    lastRollTime: null,
    playTimeThisSession: 0,
    sessionStartTime: new Date(),
  },
  adventureSkills: {
    selectedSkill: null,
    availableSkills: [],
    showSelectionModal: false,
    skillEffects: {
      skipCardUsed: false,
      metalShieldUsed: false,
      dodgeUsed: false,
      truthLiesActive: false,
      lightningChainActive: false,
      rampActive: false,
      berserkerActive: false,
      vampiricActive: false,
      phoenixUsed: false,
      timeSlowActive: false,
      criticalStrikeActive: false,
      shieldWallActive: false,
      poisonBladeActive: false,
      arcaneShieldActive: false,
      battleFrenzyActive: false,
      elementalMasteryActive: false,
      shadowStepUsed: false,
      healingAuraActive: false,
      doubleStrikeActive: false,
      manaShieldActive: false,
      berserkRageActive: false,
      divineProtectionUsed: false,
      stormCallActive: false,
      bloodPactActive: false,
      frostArmorActive: false,
      fireballActive: false,
    },
  },
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load game state from storage
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          
          // Ensure all new properties exist with defaults
          const mergedState = {
            ...createInitialGameState(),
            ...parsedState,
            settings: {
              ...createInitialGameState().settings,
              ...parsedState.settings,
            },
            skills: {
              ...createInitialGameState().skills,
              ...parsedState.skills,
            },
            adventureSkills: {
              ...createInitialGameState().adventureSkills,
              ...parsedState.adventureSkills,
            },
          };

          // Convert date strings back to Date objects
          if (mergedState.statistics?.sessionStartTime) {
            mergedState.statistics.sessionStartTime = new Date(mergedState.statistics.sessionStartTime);
          }
          if (mergedState.offlineProgress?.lastSaveTime) {
            mergedState.offlineProgress.lastSaveTime = new Date(mergedState.offlineProgress.lastSaveTime);
          }
          if (mergedState.gardenOfGrowth?.plantedAt) {
            mergedState.gardenOfGrowth.plantedAt = new Date(mergedState.gardenOfGrowth.plantedAt);
          }
          if (mergedState.gardenOfGrowth?.lastWatered) {
            mergedState.gardenOfGrowth.lastWatered = new Date(mergedState.gardenOfGrowth.lastWatered);
          }
          if (mergedState.yojefMarket?.lastRefresh) {
            mergedState.yojefMarket.lastRefresh = new Date(mergedState.yojefMarket.lastRefresh);
          }
          if (mergedState.yojefMarket?.nextRefresh) {
            mergedState.yojefMarket.nextRefresh = new Date(mergedState.yojefMarket.nextRefresh);
          }
          if (mergedState.skills?.sessionStartTime) {
            mergedState.skills.sessionStartTime = new Date(mergedState.skills.sessionStartTime);
          }
          if (mergedState.skills?.lastRollTime) {
            mergedState.skills.lastRollTime = new Date(mergedState.skills.lastRollTime);
          }
          if (mergedState.skills?.activeMenuSkill?.activatedAt) {
            mergedState.skills.activeMenuSkill.activatedAt = new Date(mergedState.skills.activeMenuSkill.activatedAt);
          }
          if (mergedState.skills?.activeMenuSkill?.expiresAt) {
            mergedState.skills.activeMenuSkill.expiresAt = new Date(mergedState.skills.activeMenuSkill.expiresAt);
          }

          // Calculate offline progress
          const now = new Date();
          const lastSave = mergedState.offlineProgress.lastSaveTime;
          const offlineTimeMs = now.getTime() - lastSave.getTime();
          const offlineTimeHours = offlineTimeMs / (1000 * 60 * 60);
          
          if (offlineTimeHours > 0.1) { // Only if offline for more than 6 minutes
            const maxOfflineHours = mergedState.offlineProgress.maxOfflineHours;
            const actualOfflineHours = Math.min(offlineTimeHours, maxOfflineHours);
            
            // Calculate offline rewards based on research level
            const researchBonus = mergedState.research.level * 0.1;
            const offlineCoins = Math.floor(actualOfflineHours * 10 * (1 + researchBonus));
            const offlineGems = Math.floor(actualOfflineHours * 1 * (1 + researchBonus));
            
            mergedState.offlineProgress.offlineCoins = offlineCoins;
            mergedState.offlineProgress.offlineGems = offlineGems;
            mergedState.offlineProgress.offlineTime = actualOfflineHours * 3600; // in seconds
          }

          // Update garden growth
          if (mergedState.gardenOfGrowth.isPlanted && mergedState.gardenOfGrowth.waterHoursRemaining > 0) {
            const plantedAt = mergedState.gardenOfGrowth.plantedAt;
            const lastWatered = mergedState.gardenOfGrowth.lastWatered || plantedAt;
            const timeSinceWatered = (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60); // hours
            
            // Reduce water
            mergedState.gardenOfGrowth.waterHoursRemaining = Math.max(0, mergedState.gardenOfGrowth.waterHoursRemaining - timeSinceWatered);
            
            // Grow plant if watered
            if (mergedState.gardenOfGrowth.waterHoursRemaining > 0) {
              const growthRate = 0.5; // cm per hour
              const growth = timeSinceWatered * growthRate;
              mergedState.gardenOfGrowth.growthCm = Math.min(
                mergedState.gardenOfGrowth.maxGrowthCm,
                mergedState.gardenOfGrowth.growthCm + growth
              );
            }
            
            // Update total growth bonus
            mergedState.gardenOfGrowth.totalGrowthBonus = mergedState.gardenOfGrowth.growthCm * 5;
          }

          // Check for daily rewards
          const lastClaimDate = mergedState.dailyRewards.lastClaimDate ? new Date(mergedState.dailyRewards.lastClaimDate) : null;
          if (!lastClaimDate || (now.getTime() - lastClaimDate.getTime()) >= 24 * 60 * 60 * 1000) {
            const nextDay = mergedState.dailyRewards.currentStreak + 1;
            const baseCoins = 50 + (nextDay * 25);
            const baseGems = 5 + Math.floor(nextDay / 2);
            
            mergedState.dailyRewards.availableReward = {
              day: nextDay,
              coins: baseCoins,
              gems: baseGems,
              special: nextDay === 7 ? 'Legendary Chest' : nextDay === 14 ? 'Mythical Item' : undefined,
              claimed: false,
            };
          }

          setGameState(mergedState);
        } else {
          setGameState(createInitialGameState());
        }
      } catch (error) {
        console.error('Error loading game state:', error);
        setGameState(createInitialGameState());
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, []);

  // Save game state to storage
  const saveGameState = useCallback(async (state: GameState) => {
    try {
      // Update last save time
      state.offlineProgress.lastSaveTime = new Date();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      saveGameState(gameState);
    }, 30000);

    return () => clearInterval(interval);
  }, [gameState, saveGameState]);

  // Calculate player stats with bonuses
  const calculatePlayerStats = useCallback((state: GameState) => {
    const researchBonuses = calculateTotalResearchBonuses(state.research);
    const gardenBonus = state.gardenOfGrowth.totalGrowthBonus / 100;
    
    // Base stats
    let atk = state.playerStats.baseAtk;
    let def = state.playerStats.baseDef;
    let maxHp = state.playerStats.baseHp;

    // Equipment bonuses
    if (state.inventory.currentWeapon) {
      const weapon = state.inventory.currentWeapon;
      const weaponAtk = weapon.baseAtk + (weapon.level - 1) * 10;
      const durabilityMultiplier = weapon.durability / weapon.maxDurability;
      atk += Math.floor(weaponAtk * durabilityMultiplier);
    }

    if (state.inventory.currentArmor) {
      const armor = state.inventory.currentArmor;
      const armorDef = armor.baseDef + (armor.level - 1) * 5;
      const durabilityMultiplier = armor.durability / armor.maxDurability;
      def += Math.floor(armorDef * durabilityMultiplier);
    }

    // Relic bonuses
    state.inventory.equippedRelics.forEach(relic => {
      if (relic.type === 'weapon' && relic.baseAtk) {
        atk += relic.baseAtk + (relic.level - 1) * 22;
      } else if (relic.type === 'armor' && relic.baseDef) {
        def += relic.baseDef + (relic.level - 1) * 15;
      }
    });

    // Research bonuses
    atk += Math.floor(atk * (researchBonuses.atk / 100));
    def += Math.floor(def * (researchBonuses.def / 100));
    maxHp += Math.floor(maxHp * (researchBonuses.hp / 100));

    // Garden bonuses
    atk += Math.floor(atk * gardenBonus);
    def += Math.floor(def * gardenBonus);
    maxHp += Math.floor(maxHp * gardenBonus);

    return {
      ...state.playerStats,
      atk,
      def,
      maxHp: Math.max(maxHp, 1),
      hp: Math.min(state.playerStats.hp, maxHp),
    };
  }, []);

  // Update player stats whenever relevant data changes
  useEffect(() => {
    if (!gameState) return;

    const updatedStats = calculatePlayerStats(gameState);
    if (JSON.stringify(updatedStats) !== JSON.stringify(gameState.playerStats)) {
      setGameState(prev => prev ? { ...prev, playerStats: updatedStats } : null);
    }
  }, [gameState?.inventory, gameState?.research, gameState?.gardenOfGrowth, calculatePlayerStats]);

  const rollSkill = useCallback((): boolean => {
    if (!gameState || gameState.coins < 100) return false;

    // Check if there's already an active skill
    if (gameState.skills.activeMenuSkill && new Date() < new Date(gameState.skills.activeMenuSkill.expiresAt)) {
      return false;
    }

    const skillTypes = [
      'coin_vacuum', 'treasurer', 'xp_surge', 'luck_gem', 'enchanter', 'time_warp',
      'golden_touch', 'knowledge_boost', 'durability_master', 'relic_finder',
      'stat_amplifier', 'question_master', 'gem_magnet', 'streak_guardian',
      'revival_blessing', 'zone_skipper', 'item_duplicator', 'research_accelerator',
      'garden_booster', 'market_refresh', 'mega_multiplier', 'instant_heal',
      'perfect_accuracy', 'treasure_magnet', 'skill_cooldown', 'auto_upgrade',
      'legendary_luck', 'time_freeze', 'double_rewards', 'infinite_energy'
    ];

    const randomSkillType = skillTypes[Math.floor(Math.random() * skillTypes.length)] as MenuSkill['type'];
    
    // Skill durations (in hours)
    const skillDurations: Record<MenuSkill['type'], number> = {
      coin_vacuum: 1,
      treasurer: 0.5,
      xp_surge: 24,
      luck_gem: 1,
      enchanter: 2,
      time_warp: 12,
      golden_touch: 8,
      knowledge_boost: 24,
      durability_master: 6,
      relic_finder: 2,
      stat_amplifier: 4,
      question_master: 2,
      gem_magnet: 3,
      streak_guardian: 1,
      revival_blessing: 24,
      zone_skipper: 0.1,
      item_duplicator: 0.1,
      research_accelerator: 6,
      garden_booster: 2,
      market_refresh: 0.1,
      mega_multiplier: 0.5,
      instant_heal: 1,
      perfect_accuracy: 0.25,
      treasure_magnet: 2,
      skill_cooldown: 4,
      auto_upgrade: 3,
      legendary_luck: 1,
      time_freeze: 0.75,
      double_rewards: 2,
      infinite_energy: 0.33
    };

    const skillNames: Record<MenuSkill['type'], string> = {
      coin_vacuum: 'Coin Vacuum',
      treasurer: 'Treasurer',
      xp_surge: 'XP Surge',
      luck_gem: 'Lucky Gem',
      enchanter: 'Enchanter',
      time_warp: 'Time Warp',
      golden_touch: 'Golden Touch',
      knowledge_boost: 'Knowledge Boost',
      durability_master: 'Durability Master',
      relic_finder: 'Relic Finder',
      stat_amplifier: 'Stat Amplifier',
      question_master: 'Question Master',
      gem_magnet: 'Gem Magnet',
      streak_guardian: 'Streak Guardian',
      revival_blessing: 'Revival Blessing',
      zone_skipper: 'Zone Skipper',
      item_duplicator: 'Item Duplicator',
      research_accelerator: 'Research Accelerator',
      garden_booster: 'Garden Booster',
      market_refresh: 'Market Refresh',
      mega_multiplier: 'Mega Multiplier',
      instant_heal: 'Instant Heal',
      perfect_accuracy: 'Perfect Accuracy',
      treasure_magnet: 'Treasure Magnet',
      skill_cooldown: 'Skill Cooldown',
      auto_upgrade: 'Auto Upgrade',
      legendary_luck: 'Legendary Luck',
      time_freeze: 'Time Freeze',
      double_rewards: 'Double Rewards',
      infinite_energy: 'Infinite Energy'
    };

    const skillDescriptions: Record<MenuSkill['type'], string> = {
      coin_vacuum: 'Get 15 free coins per minute of play time',
      treasurer: 'Guarantees next chest opened is epic or better',
      xp_surge: 'Gives 300% XP gains for 24 hours',
      luck_gem: 'All gems mined for 1 hour are shiny gems',
      enchanter: 'Epic+ drops have 80% chance to be enchanted',
      time_warp: 'Get 50% more time to answer questions for 12 hours',
      golden_touch: 'All coin rewards are doubled for 8 hours',
      knowledge_boost: 'Knowledge streaks build 50% faster for 24 hours',
      durability_master: 'Items lose no durability for 6 hours',
      relic_finder: 'Next 3 Yojef Market refreshes have guaranteed legendary relics',
      stat_amplifier: 'All stats (ATK, DEF, HP) increased by 50% for 4 hours',
      question_master: 'See question category and difficulty before answering for 2 hours',
      gem_magnet: 'Triple gem rewards from all sources for 3 hours',
      streak_guardian: 'Knowledge streak cannot be broken for 1 hour',
      revival_blessing: 'Gain 3 extra revival chances for this session',
      zone_skipper: 'Skip directly to zone +5 without fighting',
      item_duplicator: 'Next item found is automatically duplicated',
      research_accelerator: 'Research costs 50% less for 6 hours',
      garden_booster: 'Garden grows 5x faster for 2 hours',
      market_refresh: 'Instantly refresh Yojef Market with premium items',
      mega_multiplier: 'All rewards multiplied by 5x for 30 minutes',
      instant_heal: 'Instantly restore full HP and gain immunity for 1 hour',
      perfect_accuracy: 'All answers are automatically correct for 15 minutes',
      treasure_magnet: 'All chests opened give legendary+ items for 2 hours',
      skill_cooldown: 'Reduce all skill cooldowns by 75% for 4 hours',
      auto_upgrade: 'Items automatically upgrade when you have enough gems for 3 hours',
      legendary_luck: 'All random events have maximum luck for 1 hour',
      time_freeze: 'Pause all timers and cooldowns for 45 minutes',
      double_rewards: 'Every reward is doubled (stacks with other multipliers) for 2 hours',
      infinite_energy: 'Unlimited actions and no resource costs for 20 minutes'
    };

    const duration = skillDurations[randomSkillType];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

    const newSkill: MenuSkill = {
      id: Math.random().toString(36).substr(2, 9),
      name: skillNames[randomSkillType],
      description: skillDescriptions[randomSkillType],
      duration,
      activatedAt: now,
      expiresAt,
      type: randomSkillType,
    };

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        coins: prev.coins - 100,
        skills: {
          ...prev.skills,
          activeMenuSkill: newSkill,
          lastRollTime: now,
        },
      };
    });

    return true;
  }, [gameState]);

  const upgradeSkill = useCallback((skillId: string): boolean => {
    if (!gameState) return false;

    // Cheaper skill costs
    const skillCosts: Record<string, number> = {
      combat_mastery: 1,
      knowledge_boost: 1, // Reduced from 2
      treasure_hunter: 1, // Reduced from 2
      durability_expert: 2, // Reduced from 3
      streak_master: 2, // Reduced from 3
      health_regeneration: 3, // Reduced from 4
    };

    const cost = skillCosts[skillId] || 1;
    if (gameState.progression.skillPoints < cost) return false;

    const maxLevels: Record<string, number> = {
      combat_mastery: 10,
      knowledge_boost: 5,
      treasure_hunter: 8,
      durability_expert: 5,
      streak_master: 4,
      health_regeneration: 3,
    };

    const currentLevel = gameState.progression.unlockedSkills.filter(s => s === skillId).length;
    const maxLevel = maxLevels[skillId] || 10;

    if (currentLevel >= maxLevel) return false;

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        progression: {
          ...prev.progression,
          skillPoints: prev.progression.skillPoints - cost,
          unlockedSkills: [...prev.progression.unlockedSkills, skillId],
        },
      };
    });

    return true;
  }, [gameState]);

  const prestige = useCallback((): boolean => {
    if (!gameState || gameState.progression.level < 50) return false;

    const prestigeReward = Math.floor(gameState.progression.level / 10);

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        progression: {
          ...prev.progression,
          level: 1,
          experience: 0,
          experienceToNext: 100,
          skillPoints: 0,
          unlockedSkills: [],
          prestigeLevel: prev.progression.prestigeLevel + 1,
          prestigePoints: prev.progression.prestigePoints + prestigeReward,
        },
        playerStats: {
          ...prev.playerStats,
          hp: prev.playerStats.baseHp,
        },
      };
    });

    return true;
  }, [gameState]);

  // Rest of the existing methods remain the same...
  // (equipWeapon, equipArmor, upgradeWeapon, etc.)

  const equipWeapon = useCallback((weapon: Weapon) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          currentWeapon: weapon,
        },
      };
    });
  }, []);

  const equipArmor = useCallback((armor: Armor) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          currentArmor: armor,
        },
      };
    });
  }, []);

  const upgradeWeapon = useCallback((weaponId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const weapon = prev.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon || prev.gems < weapon.upgradeCost) return prev;

      const updatedWeapons = prev.inventory.weapons.map(w => 
        w.id === weaponId 
          ? { ...w, level: w.level + 1, upgradeCost: Math.floor(w.upgradeCost * 1.5) }
          : w
      );

      const updatedCurrentWeapon = prev.inventory.currentWeapon?.id === weaponId
        ? updatedWeapons.find(w => w.id === weaponId) || prev.inventory.currentWeapon
        : prev.inventory.currentWeapon;

      return {
        ...prev,
        gems: prev.gems - weapon.upgradeCost,
        inventory: {
          ...prev.inventory,
          weapons: updatedWeapons,
          currentWeapon: updatedCurrentWeapon,
        },
        statistics: {
          ...prev.statistics,
          itemsUpgraded: prev.statistics.itemsUpgraded + 1,
        },
      };
    });
  }, []);

  const upgradeArmor = useCallback((armorId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const armor = prev.inventory.armor.find(a => a.id === armorId);
      if (!armor || prev.gems < armor.upgradeCost) return prev;

      const updatedArmor = prev.inventory.armor.map(a => 
        a.id === armorId 
          ? { ...a, level: a.level + 1, upgradeCost: Math.floor(a.upgradeCost * 1.5) }
          : a
      );

      const updatedCurrentArmor = prev.inventory.currentArmor?.id === armorId
        ? updatedArmor.find(a => a.id === armorId) || prev.inventory.currentArmor
        : prev.inventory.currentArmor;

      return {
        ...prev,
        gems: prev.gems - armor.upgradeCost,
        inventory: {
          ...prev.inventory,
          armor: updatedArmor,
          currentArmor: updatedCurrentArmor,
        },
        statistics: {
          ...prev.statistics,
          itemsUpgraded: prev.statistics.itemsUpgraded + 1,
        },
      };
    });
  }, []);

  const sellWeapon = useCallback((weaponId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const weapon = prev.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon || prev.inventory.currentWeapon?.id === weaponId) return prev;

      return {
        ...prev,
        coins: prev.coins + weapon.sellPrice,
        inventory: {
          ...prev.inventory,
          weapons: prev.inventory.weapons.filter(w => w.id !== weaponId),
        },
        statistics: {
          ...prev.statistics,
          itemsSold: prev.statistics.itemsSold + 1,
        },
      };
    });
  }, []);

  const sellArmor = useCallback((armorId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const armor = prev.inventory.armor.find(a => a.id === armorId);
      if (!armor || prev.inventory.currentArmor?.id === armorId) return prev;

      return {
        ...prev,
        coins: prev.coins + armor.sellPrice,
        inventory: {
          ...prev.inventory,
          armor: prev.inventory.armor.filter(a => a.id !== armorId),
        },
        statistics: {
          ...prev.statistics,
          itemsSold: prev.statistics.itemsSold + 1,
        },
      };
    });
  }, []);

  const upgradeResearch = useCallback((type: 'atk' | 'def' | 'hp') => {
    setGameState(prev => {
      if (!prev) return null;
      
      const cost = 100 + (prev.research.level * 50);
      if (prev.coins < cost) return prev;

      return {
        ...prev,
        coins: prev.coins - cost,
        research: {
          ...prev.research,
          level: prev.research.level + 1,
          totalSpent: prev.research.totalSpent + cost,
        },
        statistics: {
          ...prev.statistics,
          totalResearchSpent: prev.statistics.totalResearchSpent + cost,
        },
      };
    });
  }, []);

  const openChest = useCallback((cost: number): ChestReward | null => {
    if (!gameState || gameState.coins < cost) return null;

    const weights = getChestRarityWeights(cost);
    const random = Math.random() * 100;
    
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical' = 'common';
    let cumulative = 0;
    
    const rarities: ('common' | 'rare' | 'epic' | 'legendary' | 'mythical')[] = ['common', 'rare', 'epic', 'legendary', 'mythical'];
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        rarity = rarities[i];
        break;
      }
    }

    // 20% chance for gems instead of items
    if (Math.random() < 0.2) {
      const gemAmount = cost === 1000 ? 50 : cost === 400 ? 25 : cost === 200 ? 15 : 10;
      
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          coins: prev.coins - cost,
          gems: prev.gems + gemAmount,
          statistics: {
            ...prev.statistics,
            chestsOpened: prev.statistics.chestsOpened + 1,
            gemsEarned: prev.statistics.gemsEarned + gemAmount,
          },
        };
      });

      return { type: 'gems', gems: gemAmount };
    }

    // Generate items
    const items: (Weapon | Armor)[] = [];
    const itemCount = cost >= 400 ? 2 : 1;
    
    for (let i = 0; i < itemCount; i++) {
      const isWeapon = Math.random() < 0.5;
      const forceEnchanted = Math.random() < 0.05; // 5% chance for enchanted
      
      if (isWeapon) {
        items.push(generateWeapon(false, rarity, forceEnchanted));
      } else {
        items.push(generateArmor(false, rarity, forceEnchanted));
      }
    }

    setGameState(prev => {
      if (!prev) return null;
      
      const newWeapons = items.filter(item => 'baseAtk' in item) as Weapon[];
      const newArmor = items.filter(item => 'baseDef' in item) as Armor[];
      
      // Update collection book
      const updatedCollectionBook = { ...prev.collectionBook };
      items.forEach(item => {
        if ('baseAtk' in item) {
          if (!updatedCollectionBook.weapons[item.name]) {
            updatedCollectionBook.weapons[item.name] = true;
            updatedCollectionBook.totalWeaponsFound += 1;
          }
        } else {
          if (!updatedCollectionBook.armor[item.name]) {
            updatedCollectionBook.armor[item.name] = true;
            updatedCollectionBook.totalArmorFound += 1;
          }
        }
        updatedCollectionBook.rarityStats[item.rarity] += 1;
      });

      return {
        ...prev,
        coins: prev.coins - cost,
        gems: prev.gems + Math.floor(Math.random() * 10) + 5, // Bonus gems
        inventory: {
          ...prev.inventory,
          weapons: [...prev.inventory.weapons, ...newWeapons],
          armor: [...prev.inventory.armor, ...newArmor],
        },
        collectionBook: updatedCollectionBook,
        statistics: {
          ...prev.statistics,
          chestsOpened: prev.statistics.chestsOpened + 1,
          itemsCollected: prev.statistics.itemsCollected + items.length,
          gemsEarned: prev.statistics.gemsEarned + Math.floor(Math.random() * 10) + 5,
        },
      };
    });

    return { type: 'weapon', items };
  }, [gameState]);

  const purchaseMythical = useCallback((type: 'weapon' | 'armor'): boolean => {
    if (!gameState || gameState.coins < 5000) return false;

    const item = type === 'weapon' ? generateWeapon(false, 'mythical') : generateArmor(false, 'mythical');

    setGameState(prev => {
      if (!prev) return null;
      
      const updatedCollectionBook = { ...prev.collectionBook };
      if (type === 'weapon') {
        if (!updatedCollectionBook.weapons[item.name]) {
          updatedCollectionBook.weapons[item.name] = true;
          updatedCollectionBook.totalWeaponsFound += 1;
        }
        updatedCollectionBook.rarityStats.mythical += 1;
      } else {
        if (!updatedCollectionBook.armor[item.name]) {
          updatedCollectionBook.armor[item.name] = true;
          updatedCollectionBook.totalArmorFound += 1;
        }
        updatedCollectionBook.rarityStats.mythical += 1;
      }

      return {
        ...prev,
        coins: prev.coins - 5000,
        inventory: {
          ...prev.inventory,
          weapons: type === 'weapon' ? [...prev.inventory.weapons, item as Weapon] : prev.inventory.weapons,
          armor: type === 'armor' ? [...prev.inventory.armor, item as Armor] : prev.inventory.armor,
        },
        collectionBook: updatedCollectionBook,
        statistics: {
          ...prev.statistics,
          itemsCollected: prev.statistics.itemsCollected + 1,
        },
      };
    });

    return true;
  }, [gameState]);

  const startCombat = useCallback(() => {
    if (!gameState || gameState.inCombat) return;

    const enemy = generateEnemy(gameState.zone);
    
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentEnemy: enemy,
        inCombat: true,
        combatLog: [`You encounter a ${enemy.name} in Zone ${enemy.zone}!`],
        hasUsedRevival: false,
      };
    });
  }, [gameState]);

  const attack = useCallback((hit: boolean, category?: string) => {
    if (!gameState || !gameState.currentEnemy) return;

    setGameState(prev => {
      if (!prev || !prev.currentEnemy) return prev;

      let newState = { ...prev };
      const enemy = { ...prev.currentEnemy };
      const playerStats = { ...prev.playerStats };
      let combatLog = [...prev.combatLog];

      // Update statistics
      newState.statistics = {
        ...prev.statistics,
        totalQuestionsAnswered: prev.statistics.totalQuestionsAnswered + 1,
      };

      // Update category accuracy
      if (category) {
        const categoryStats = prev.statistics.accuracyByCategory[category] || { correct: 0, total: 0 };
        newState.statistics.accuracyByCategory = {
          ...prev.statistics.accuracyByCategory,
          [category]: {
            correct: categoryStats.correct + (hit ? 1 : 0),
            total: categoryStats.total + 1,
          },
        };
      }

      if (hit) {
        // Player hits enemy
        const damage = Math.max(1, playerStats.atk - enemy.def);
        enemy.hp = Math.max(0, enemy.hp - damage);
        combatLog.push(`You deal ${damage} damage to the ${enemy.name}!`);
        
        // Update knowledge streak
        newState.knowledgeStreak = {
          ...prev.knowledgeStreak,
          current: prev.knowledgeStreak.current + 1,
          best: Math.max(prev.knowledgeStreak.best, prev.knowledgeStreak.current + 1),
          multiplier: 1 + Math.min(prev.knowledgeStreak.current + 1, 50) * 0.02,
        };

        newState.statistics.correctAnswers = prev.statistics.correctAnswers + 1;
        newState.statistics.totalDamageDealt = prev.statistics.totalDamageDealt + damage;

        if (enemy.hp <= 0) {
          // Enemy defeated
          combatLog.push(`You defeated the ${enemy.name}!`);
          
          // Calculate rewards with streak multiplier
          const baseCoins = 10 + (prev.zone * 2);
          const baseGems = Math.floor(prev.zone / 5) + 1;
          const streakMultiplier = newState.knowledgeStreak.multiplier;
          
          const coinReward = Math.floor(baseCoins * streakMultiplier);
          const gemReward = Math.floor(baseGems * streakMultiplier);
          
          newState.coins = prev.coins + coinReward;
          newState.gems = prev.gems + gemReward;
          newState.zone = prev.zone + 1;
          newState.inCombat = false;
          newState.currentEnemy = null;
          
          // Add experience
          const expGain = 25 + (prev.zone * 5);
          newState.progression = {
            ...prev.progression,
            experience: prev.progression.experience + expGain,
          };

          // Level up check
          while (newState.progression.experience >= newState.progression.experienceToNext) {
            newState.progression.experience -= newState.progression.experienceToNext;
            newState.progression.level += 1;
            newState.progression.skillPoints += 1;
            newState.progression.experienceToNext = Math.floor(100 * Math.pow(1.1, newState.progression.level - 1));
            combatLog.push(`Level up! You are now level ${newState.progression.level}!`);
          }

          combatLog.push(`You earned ${coinReward} coins and ${gemReward} gems!`);
          
          // Check for premium status
          if (newState.zone >= 50 && !prev.isPremium) {
            newState.isPremium = true;
            combatLog.push('🎉 Premium status unlocked! 🎉');
          }

          // Item drops for zones 10+
          if (prev.zone >= 10 && Math.random() < 0.3) {
            const isWeapon = Math.random() < 0.5;
            const item = isWeapon ? generateWeapon() : generateArmor();
            
            if (isWeapon) {
              newState.inventory.weapons = [...prev.inventory.weapons, item as Weapon];
            } else {
              newState.inventory.armor = [...prev.inventory.armor, item as Armor];
            }
            
            combatLog.push(`The ${enemy.name} dropped a ${item.name}!`);
          }

          newState.statistics = {
            ...newState.statistics,
            totalVictories: prev.statistics.totalVictories + 1,
            zonesReached: Math.max(prev.statistics.zonesReached, newState.zone),
            coinsEarned: prev.statistics.coinsEarned + coinReward,
            gemsEarned: prev.statistics.gemsEarned + gemReward,
          };
        }
      } else {
        // Player misses, enemy attacks
        const damage = Math.max(1, enemy.atk - playerStats.def);
        playerStats.hp = Math.max(0, playerStats.hp - damage);
        combatLog.push(`The ${enemy.name} attacks you for ${damage} damage!`);
        
        // Reset knowledge streak
        newState.knowledgeStreak = {
          ...prev.knowledgeStreak,
          current: 0,
          multiplier: 1,
        };

        newState.statistics.totalDamageTaken = prev.statistics.totalDamageTaken + damage;

        if (playerStats.hp <= 0) {
          // Player defeated
          if (!prev.hasUsedRevival) {
            // Use revival
            playerStats.hp = Math.floor(playerStats.maxHp * 0.5);
            newState.hasUsedRevival = true;
            combatLog.push('💖 You have been revived with 50% HP!');
            newState.statistics.revivals = prev.statistics.revivals + 1;
          } else {
            // Game over
            combatLog.push('You have been defeated!');
            newState.inCombat = false;
            newState.currentEnemy = null;
            newState.statistics.totalDeaths = prev.statistics.totalDeaths + 1;
          }
        }
      }

      // Reduce item durability
      if (prev.inventory.currentWeapon) {
        const updatedWeapons = prev.inventory.weapons.map(w => 
          w.id === prev.inventory.currentWeapon?.id 
            ? { ...w, durability: Math.max(0, w.durability - 1) }
            : w
        );
        newState.inventory = {
          ...newState.inventory,
          weapons: updatedWeapons,
          currentWeapon: updatedWeapons.find(w => w.id === prev.inventory.currentWeapon?.id) || null,
        };
      }

      if (prev.inventory.currentArmor) {
        const updatedArmor = prev.inventory.armor.map(a => 
          a.id === prev.inventory.currentArmor?.id 
            ? { ...a, durability: Math.max(0, a.durability - 1) }
            : a
        );
        newState.inventory = {
          ...newState.inventory,
          armor: updatedArmor,
          currentArmor: updatedArmor.find(a => a.id === prev.inventory.currentArmor?.id) || null,
        };
      }

      return {
        ...newState,
        currentEnemy: enemy.hp > 0 ? enemy : null,
        playerStats,
        combatLog: combatLog.slice(-10), // Keep last 10 messages
      };
    });
  }, [gameState]);

  const resetGame = useCallback(() => {
    const newState = createInitialGameState();
    setGameState(newState);
    saveGameState(newState);
  }, [saveGameState]);

  const setGameMode = useCallback((mode: 'normal' | 'blitz' | 'bloodlust' | 'survival') => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gameMode: {
          ...prev.gameMode,
          current: mode,
          survivalLives: mode === 'survival' ? 3 : prev.gameMode.survivalLives,
        },
      };
    });
  }, []);

  const toggleCheat = useCallback((cheat: keyof typeof gameState.cheats) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cheats: {
          ...prev.cheats,
          [cheat]: !prev.cheats[cheat],
        },
      };
    });
  }, [gameState]);

  const generateCheatItem = useCallback((type: 'weapon' | 'armor', rarity: string) => {
    const item = type === 'weapon' 
      ? generateWeapon(false, rarity as any) 
      : generateArmor(false, rarity as any);

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          weapons: type === 'weapon' ? [...prev.inventory.weapons, item as Weapon] : prev.inventory.weapons,
          armor: type === 'armor' ? [...prev.inventory.armor, item as Armor] : prev.inventory.armor,
        },
      };
    });
  }, []);

  const mineGem = useCallback((x: number, y: number): { gems: number; shinyGems: number } | null => {
    if (!gameState) return null;

    const isShiny = Math.random() < 0.05; // 5% chance for shiny
    const gems = isShiny ? 0 : 1;
    const shinyGems = isShiny ? 1 : 0;

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gems: prev.gems + gems,
        shinyGems: prev.shinyGems + shinyGems,
        mining: {
          ...prev.mining,
          totalGemsMined: prev.mining.totalGemsMined + gems,
          totalShinyGemsMined: prev.mining.totalShinyGemsMined + shinyGems,
        },
        statistics: {
          ...prev.statistics,
          gemsEarned: prev.statistics.gemsEarned + gems,
          shinyGemsEarned: prev.statistics.shinyGemsEarned + shinyGems,
        },
      };
    });

    return { gems, shinyGems };
  }, [gameState]);

  const exchangeShinyGems = useCallback((amount: number): boolean => {
    if (!gameState || gameState.shinyGems < amount) return false;

    const regularGems = amount * 10;

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        shinyGems: prev.shinyGems - amount,
        gems: prev.gems + regularGems,
        statistics: {
          ...prev.statistics,
          gemsEarned: prev.statistics.gemsEarned + regularGems,
        },
      };
    });

    return true;
  }, [gameState]);

  const discardItem = useCallback((itemId: string, type: 'weapon' | 'armor') => {
    setGameState(prev => {
      if (!prev) return null;
      
      if (type === 'weapon') {
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            weapons: prev.inventory.weapons.filter(w => w.id !== itemId),
          },
        };
      } else {
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            armor: prev.inventory.armor.filter(a => a.id !== itemId),
          },
        };
      }
    });
  }, []);

  const purchaseRelic = useCallback((relicId: string): boolean => {
    if (!gameState) return false;

    const relic = gameState.yojefMarket.items.find(r => r.id === relicId);
    if (!relic || gameState.gems < relic.cost || gameState.inventory.equippedRelics.length >= 5) return false;

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gems: prev.gems - relic.cost,
        inventory: {
          ...prev.inventory,
          relics: [...prev.inventory.relics, relic],
          equippedRelics: [...prev.inventory.equippedRelics, relic],
        },
        yojefMarket: {
          ...prev.yojefMarket,
          items: prev.yojefMarket.items.filter(r => r.id !== relicId),
        },
      };
    });

    return true;
  }, [gameState]);

  const upgradeRelic = useCallback((relicId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const relic = prev.inventory.relics.find(r => r.id === relicId);
      if (!relic || prev.gems < relic.upgradeCost) return prev;

      const updatedRelics = prev.inventory.relics.map(r => 
        r.id === relicId 
          ? { ...r, level: r.level + 1, upgradeCost: Math.floor(r.upgradeCost * 1.5) }
          : r
      );

      const updatedEquippedRelics = prev.inventory.equippedRelics.map(r => 
        r.id === relicId 
          ? updatedRelics.find(ur => ur.id === relicId) || r
          : r
      );

      return {
        ...prev,
        gems: prev.gems - relic.upgradeCost,
        inventory: {
          ...prev.inventory,
          relics: updatedRelics,
          equippedRelics: updatedEquippedRelics,
        },
      };
    });
  }, []);

  const equipRelic = useCallback((relicId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const relic = prev.inventory.relics.find(r => r.id === relicId);
      if (!relic || prev.inventory.equippedRelics.length >= 5) return prev;

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          equippedRelics: [...prev.inventory.equippedRelics, relic],
        },
      };
    });
  }, []);

  const unequipRelic = useCallback((relicId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          equippedRelics: prev.inventory.equippedRelics.filter(r => r.id !== relicId),
        },
      };
    });
  }, []);

  const sellRelic = useCallback((relicId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          relics: prev.inventory.relics.filter(r => r.id !== relicId),
          equippedRelics: prev.inventory.equippedRelics.filter(r => r.id !== relicId),
        },
      };
    });
  }, []);

  const claimDailyReward = useCallback((): boolean => {
    if (!gameState || !gameState.dailyRewards.availableReward) return false;

    const reward = gameState.dailyRewards.availableReward;
    
    setGameState(prev => {
      if (!prev || !prev.dailyRewards.availableReward) return prev;
      
      const now = new Date();
      const lastClaimDate = prev.dailyRewards.lastClaimDate ? new Date(prev.dailyRewards.lastClaimDate) : null;
      const daysSinceLastClaim = lastClaimDate ? Math.floor((now.getTime() - lastClaimDate.getTime()) / (24 * 60 * 60 * 1000)) : 0;
      
      // Reset streak if more than 1 day has passed
      const newStreak = daysSinceLastClaim > 1 ? 1 : prev.dailyRewards.currentStreak + 1;
      
      return {
        ...prev,
        coins: prev.coins + reward.coins,
        gems: prev.gems + reward.gems,
        dailyRewards: {
          ...prev.dailyRewards,
          lastClaimDate: now,
          currentStreak: newStreak,
          maxStreak: Math.max(prev.dailyRewards.maxStreak, newStreak),
          availableReward: null,
          rewardHistory: [...prev.dailyRewards.rewardHistory, { ...reward, claimed: true, claimDate: now }],
        },
        statistics: {
          ...prev.statistics,
          coinsEarned: prev.statistics.coinsEarned + reward.coins,
          gemsEarned: prev.statistics.gemsEarned + reward.gems,
        },
      };
    });

    return true;
  }, [gameState]);

  const claimOfflineRewards = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        coins: prev.coins + prev.offlineProgress.offlineCoins,
        gems: prev.gems + prev.offlineProgress.offlineGems,
        offlineProgress: {
          ...prev.offlineProgress,
          offlineCoins: 0,
          offlineGems: 0,
          offlineTime: 0,
        },
        statistics: {
          ...prev.statistics,
          coinsEarned: prev.statistics.coinsEarned + prev.offlineProgress.offlineCoins,
          gemsEarned: prev.statistics.gemsEarned + prev.offlineProgress.offlineGems,
        },
      };
    });
  }, []);

  const bulkSell = useCallback((itemIds: string[], type: 'weapon' | 'armor') => {
    setGameState(prev => {
      if (!prev) return null;
      
      let totalValue = 0;
      let newInventory = { ...prev.inventory };
      
      if (type === 'weapon') {
        const itemsToSell = prev.inventory.weapons.filter(w => itemIds.includes(w.id));
        totalValue = itemsToSell.reduce((sum, item) => sum + item.sellPrice, 0);
        newInventory.weapons = prev.inventory.weapons.filter(w => !itemIds.includes(w.id));
      } else {
        const itemsToSell = prev.inventory.armor.filter(a => itemIds.includes(a.id));
        totalValue = itemsToSell.reduce((sum, item) => sum + item.sellPrice, 0);
        newInventory.armor = prev.inventory.armor.filter(a => !itemIds.includes(a.id));
      }
      
      return {
        ...prev,
        coins: prev.coins + totalValue,
        inventory: newInventory,
        statistics: {
          ...prev.statistics,
          itemsSold: prev.statistics.itemsSold + itemIds.length,
        },
      };
    });
  }, []);

  const bulkUpgrade = useCallback((itemIds: string[], type: 'weapon' | 'armor') => {
    setGameState(prev => {
      if (!prev) return null;
      
      let totalCost = 0;
      let newInventory = { ...prev.inventory };
      
      if (type === 'weapon') {
        const itemsToUpgrade = prev.inventory.weapons.filter(w => itemIds.includes(w.id));
        totalCost = itemsToUpgrade.reduce((sum, item) => sum + item.upgradeCost, 0);
        
        if (prev.gems >= totalCost) {
          newInventory.weapons = prev.inventory.weapons.map(w => 
            itemIds.includes(w.id) 
              ? { ...w, level: w.level + 1, upgradeCost: Math.floor(w.upgradeCost * 1.5) }
              : w
          );
        } else {
          return prev;
        }
      } else {
        const itemsToUpgrade = prev.inventory.armor.filter(a => itemIds.includes(a.id));
        totalCost = itemsToUpgrade.reduce((sum, item) => sum + item.upgradeCost, 0);
        
        if (prev.gems >= totalCost) {
          newInventory.armor = prev.inventory.armor.map(a => 
            itemIds.includes(a.id) 
              ? { ...a, level: a.level + 1, upgradeCost: Math.floor(a.upgradeCost * 1.5) }
              : a
          );
        } else {
          return prev;
        }
      }
      
      return {
        ...prev,
        gems: prev.gems - totalCost,
        inventory: newInventory,
        statistics: {
          ...prev.statistics,
          itemsUpgraded: prev.statistics.itemsUpgraded + itemIds.length,
        },
      };
    });
  }, []);

  const plantSeed = useCallback((): boolean => {
    if (!gameState || gameState.coins < gameState.gardenOfGrowth.seedCost || gameState.gardenOfGrowth.isPlanted) return false;

    setGameState(prev => {
      if (!prev) return null;
      const now = new Date();
      return {
        ...prev,
        coins: prev.coins - prev.gardenOfGrowth.seedCost,
        gardenOfGrowth: {
          ...prev.gardenOfGrowth,
          isPlanted: true,
          plantedAt: now,
          lastWatered: now,
          waterHoursRemaining: 24, // Start with 24 hours of water
        },
      };
    });

    return true;
  }, [gameState]);

  const buyWater = useCallback((hours: number): boolean => {
    if (!gameState || !gameState.gardenOfGrowth.isPlanted) return false;

    const cost = Math.floor((hours / 24) * gameState.gardenOfGrowth.waterCost);
    if (gameState.coins < cost) return false;

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        coins: prev.coins - cost,
        gardenOfGrowth: {
          ...prev.gardenOfGrowth,
          waterHoursRemaining: prev.gardenOfGrowth.waterHoursRemaining + hours,
          lastWatered: new Date(),
        },
      };
    });

    return true;
  }, [gameState]);

  const updateSettings = useCallback((newSettings: Partial<typeof gameState.settings>) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          ...newSettings,
        },
      };
    });
  }, [gameState]);

  const addCoins = useCallback((amount: number) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        coins: prev.coins + amount,
      };
    });
  }, []);

  const addGems = useCallback((amount: number) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gems: prev.gems + amount,
      };
    });
  }, []);

  const teleportToZone = useCallback((zone: number) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        zone: Math.max(1, zone),
        inCombat: false,
        currentEnemy: null,
      };
    });
  }, []);

  const setExperience = useCallback((xp: number) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        progression: {
          ...prev.progression,
          experience: Math.max(0, xp),
        },
      };
    });
  }, []);

  const selectAdventureSkill = useCallback((skill: AdventureSkill) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        adventureSkills: {
          ...prev.adventureSkills,
          selectedSkill: skill,
          showSelectionModal: false,
        },
      };
    });
  }, []);

  const skipAdventureSkills = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        adventureSkills: {
          ...prev.adventureSkills,
          showSelectionModal: false,
        },
      };
    });
  }, []);

  const useSkipCard = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        adventureSkills: {
          ...prev.adventureSkills,
          skillEffects: {
            ...prev.adventureSkills.skillEffects,
            skipCardUsed: true,
          },
        },
      };
    });
  }, []);

  // Check for achievements and player tags
  useEffect(() => {
    if (!gameState) return;

    const newAchievements = checkAchievements(gameState);
    const newPlayerTags = checkPlayerTags(gameState);

    if (newAchievements.length > 0 || newPlayerTags.length > 0) {
      setGameState(prev => {
        if (!prev) return null;
        
        let updatedState = { ...prev };
        
        // Update achievements
        if (newAchievements.length > 0) {
          updatedState.achievements = prev.achievements.map(achievement => {
            const newAchievement = newAchievements.find(na => na.id === achievement.id);
            return newAchievement || achievement;
          });
          
          // Award achievement rewards
          newAchievements.forEach(achievement => {
            if (achievement.reward) {
              if (achievement.reward.coins) {
                updatedState.coins += achievement.reward.coins;
              }
              if (achievement.reward.gems) {
                updatedState.gems += achievement.reward.gems;
              }
            }
          });
        }
        
        // Update player tags
        if (newPlayerTags.length > 0) {
          updatedState.playerTags = prev.playerTags.map(tag => {
            const newTag = newPlayerTags.find(nt => nt.id === tag.id);
            return newTag || tag;
          });
        }
        
        return updatedState;
      });
    }
  }, [gameState?.zone, gameState?.statistics, gameState?.research?.level, gameState?.knowledgeStreak?.best]);

  return {
    gameState,
    isLoading,
    equipWeapon,
    equipArmor,
    upgradeWeapon,
    upgradeArmor,
    sellWeapon,
    sellArmor,
    upgradeResearch,
    openChest,
    purchaseMythical,
    startCombat,
    attack,
    resetGame,
    setGameMode,
    toggleCheat,
    generateCheatItem,
    mineGem,
    exchangeShinyGems,
    discardItem,
    purchaseRelic,
    upgradeRelic,
    equipRelic,
    unequipRelic,
    sellRelic,
    claimDailyReward,
    upgradeSkill,
    prestige,
    claimOfflineRewards,
    bulkSell,
    bulkUpgrade,
    plantSeed,
    buyWater,
    updateSettings,
    addCoins,
    addGems,
    teleportToZone,
    setExperience,
    rollSkill,
    selectAdventureSkill,
    skipAdventureSkills,
    useSkipCard,
  };
};