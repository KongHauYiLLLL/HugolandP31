import { useState, useEffect, useCallback } from 'react';
import { GameState, Weapon, Armor, Enemy, ChestReward, RelicItem, DailyReward, MenuSkill, AdventureSkill, AuctionHouse, AuctionListing, AuctionBid } from '../types/game';
import { generateWeapon, generateArmor, generateEnemy, generateRelicItem, getChestRarityWeights, calculateResearchBonus, calculateResearchCost } from '../utils/gameUtils';
import { checkAchievements, initializeAchievements } from '../utils/achievements';
import { checkPlayerTags, initializePlayerTags } from '../utils/playerTags';
import AsyncStorage from '../utils/storage';

const SAVE_KEY = 'hugoland_game_state';

const createInitialGameState = (): GameState => ({
  coins: 500,
  gems: 50,
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
    level: 1,
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
    nextRefresh: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
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
  auctionHouse: {
    playerListings: [],
    aiListings: [],
    lastRefresh: new Date(),
    nextRefresh: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
});

// Adventure skills definitions
const adventureSkillsPool: Omit<AdventureSkill, 'id'>[] = [
  {
    name: 'Risker',
    description: 'Gain +50% rewards but take +25% damage',
    type: 'risker'
  },
  {
    name: 'Lightning Chain',
    description: 'Correct answers have 30% chance to deal double damage',
    type: 'lightning_chain'
  },
  {
    name: 'Skip Card',
    description: 'Skip one question and automatically get it correct',
    type: 'skip_card'
  },
  {
    name: 'Metal Shield',
    description: 'Block the next enemy attack completely',
    type: 'metal_shield'
  },
  {
    name: 'Truth & Lies',
    description: 'Remove one wrong answer from multiple choice questions',
    type: 'truth_lies'
  },
  {
    name: 'Ramp',
    description: 'Each correct answer increases damage by 10% (stacks)',
    type: 'ramp'
  },
  {
    name: 'Dodge',
    description: 'First wrong answer deals no damage to you',
    type: 'dodge'
  },
  {
    name: 'Berserker',
    description: '+100% attack but -50% defense for this adventure',
    type: 'berserker'
  },
  {
    name: 'Vampiric',
    description: 'Heal 25% of damage dealt to enemies',
    type: 'vampiric'
  },
  {
    name: 'Phoenix',
    description: 'Revive once with 50% HP when defeated',
    type: 'phoenix'
  },
  {
    name: 'Time Slow',
    description: 'Get +3 seconds for each question',
    type: 'time_slow'
  },
  {
    name: 'Critical Strike',
    description: '25% chance to deal triple damage',
    type: 'critical_strike'
  },
  {
    name: 'Shield Wall',
    description: 'Take 50% less damage from all sources',
    type: 'shield_wall'
  },
  {
    name: 'Poison Blade',
    description: 'Enemies take 10 damage per turn after being hit',
    type: 'poison_blade'
  },
  {
    name: 'Arcane Shield',
    description: 'Absorb first 100 damage taken',
    type: 'arcane_shield'
  },
  {
    name: 'Battle Frenzy',
    description: 'Each enemy defeated increases damage by 20%',
    type: 'battle_frenzy'
  },
  {
    name: 'Elemental Mastery',
    description: 'Deal bonus damage based on question category',
    type: 'elemental_mastery'
  },
  {
    name: 'Shadow Step',
    description: 'Avoid the next 3 enemy attacks',
    type: 'shadow_step'
  },
  {
    name: 'Healing Aura',
    description: 'Regenerate 15 HP after each correct answer',
    type: 'healing_aura'
  },
  {
    name: 'Double Strike',
    description: 'Each attack hits twice',
    type: 'double_strike'
  },
  {
    name: 'Mana Shield',
    description: 'Convert 50% of damage taken to gem cost',
    type: 'mana_shield'
  },
  {
    name: 'Berserk Rage',
    description: 'Deal more damage as HP gets lower',
    type: 'berserk_rage'
  },
  {
    name: 'Divine Protection',
    description: 'Immune to death once per adventure',
    type: 'divine_protection'
  },
  {
    name: 'Storm Call',
    description: 'Wrong answers deal damage to enemies too',
    type: 'storm_call'
  },
  {
    name: 'Blood Pact',
    description: 'Sacrifice HP to deal massive damage',
    type: 'blood_pact'
  },
  {
    name: 'Frost Armor',
    description: 'Attackers take damage when hitting you',
    type: 'frost_armor'
  },
  {
    name: 'Fireball',
    description: 'Deal area damage to multiple enemies',
    type: 'fireball'
  }
];

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isLoading, setIsLoading] = useState(true);

  // Load game state from storage
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(SAVE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          
          // Ensure auctionHouse exists
          if (!parsedState.auctionHouse) {
            parsedState.auctionHouse = createInitialGameState().auctionHouse;
          }
          
          // Ensure adventureSkills exists
          if (!parsedState.adventureSkills) {
            parsedState.adventureSkills = createInitialGameState().adventureSkills;
          }
          
          // Convert date strings back to Date objects
          if (parsedState.yojefMarket) {
            parsedState.yojefMarket.lastRefresh = new Date(parsedState.yojefMarket.lastRefresh);
            parsedState.yojefMarket.nextRefresh = new Date(parsedState.yojefMarket.nextRefresh);
          }
          
          if (parsedState.auctionHouse) {
            parsedState.auctionHouse.lastRefresh = new Date(parsedState.auctionHouse.lastRefresh);
            parsedState.auctionHouse.nextRefresh = new Date(parsedState.auctionHouse.nextRefresh);
            
            // Convert auction listing dates
            parsedState.auctionHouse.playerListings = parsedState.auctionHouse.playerListings.map((listing: any) => ({
              ...listing,
              endTime: new Date(listing.endTime),
              bids: listing.bids.map((bid: any) => ({
                ...bid,
                timestamp: new Date(bid.timestamp)
              }))
            }));
            
            parsedState.auctionHouse.aiListings = parsedState.auctionHouse.aiListings.map((listing: any) => ({
              ...listing,
              endTime: new Date(listing.endTime),
              bids: listing.bids.map((bid: any) => ({
                ...bid,
                timestamp: new Date(bid.timestamp)
              }))
            }));
          }
          
          setGameState(parsedState);
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, []);

  // Save game state to storage
  const saveGameState = useCallback(async (state: GameState) => {
    try {
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, []);

  // Auto-save when game state changes
  useEffect(() => {
    if (!isLoading) {
      saveGameState(gameState);
    }
  }, [gameState, isLoading, saveGameState]);

  // Generate adventure skills for selection
  const generateAdventureSkills = useCallback((): AdventureSkill[] => {
    const shuffled = [...adventureSkillsPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map((skill, index) => ({
      ...skill,
      id: `skill_${Date.now()}_${index}`
    }));
  }, []);

  // Start combat and show adventure skill selection
  const startCombat = useCallback(() => {
    setGameState(prevState => {
      const enemy = generateEnemy(prevState.zone);
      const availableSkills = generateAdventureSkills();
      
      return {
        ...prevState,
        currentEnemy: enemy,
        inCombat: true,
        combatLog: [`You encounter a ${enemy.name} in Zone ${prevState.zone}!`],
        hasUsedRevival: false,
        adventureSkills: {
          ...prevState.adventureSkills,
          availableSkills,
          showSelectionModal: true,
          selectedSkill: null,
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
      };
    });
  }, [generateAdventureSkills]);

  // Select adventure skill
  const selectAdventureSkill = useCallback((skill: AdventureSkill) => {
    setGameState(prevState => ({
      ...prevState,
      adventureSkills: {
        ...prevState.adventureSkills,
        selectedSkill: skill,
        showSelectionModal: false,
        skillEffects: {
          ...prevState.adventureSkills.skillEffects,
          truthLiesActive: skill.type === 'truth_lies',
          lightningChainActive: skill.type === 'lightning_chain',
          rampActive: skill.type === 'ramp',
          berserkerActive: skill.type === 'berserker',
          vampiricActive: skill.type === 'vampiric',
          timeSlowActive: skill.type === 'time_slow',
          criticalStrikeActive: skill.type === 'critical_strike',
          shieldWallActive: skill.type === 'shield_wall',
          poisonBladeActive: skill.type === 'poison_blade',
          arcaneShieldActive: skill.type === 'arcane_shield',
          battleFrenzyActive: skill.type === 'battle_frenzy',
          elementalMasteryActive: skill.type === 'elemental_mastery',
          healingAuraActive: skill.type === 'healing_aura',
          doubleStrikeActive: skill.type === 'double_strike',
          manaShieldActive: skill.type === 'mana_shield',
          berserkRageActive: skill.type === 'berserk_rage',
          stormCallActive: skill.type === 'storm_call',
          bloodPactActive: skill.type === 'blood_pact',
          frostArmorActive: skill.type === 'frost_armor',
          fireballActive: skill.type === 'fireball',
        },
      },
    }));
  }, []);

  // Skip adventure skills
  const skipAdventureSkills = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      adventureSkills: {
        ...prevState.adventureSkills,
        showSelectionModal: false,
        selectedSkill: null,
      },
    }));
  }, []);

  // Use skip card
  const useSkipCard = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      adventureSkills: {
        ...prevState.adventureSkills,
        skillEffects: {
          ...prevState.adventureSkills.skillEffects,
          skipCardUsed: true,
        },
      },
    }));
  }, []);

  // Attack function
  const attack = useCallback((hit: boolean, category?: string) => {
    setGameState(prevState => {
      if (!prevState.currentEnemy) return prevState;

      let newState = { ...prevState };
      let damage = 0;
      let enemyDamage = 0;

      if (hit) {
        // Calculate player damage
        damage = Math.max(1, newState.playerStats.atk - newState.currentEnemy.def);
        
        // Apply adventure skill effects
        if (newState.adventureSkills.skillEffects.lightningChainActive && Math.random() < 0.3) {
          damage *= 2;
          newState.combatLog.push('⚡ Lightning Chain activated! Double damage!');
        }
        
        if (newState.adventureSkills.skillEffects.criticalStrikeActive && Math.random() < 0.25) {
          damage *= 3;
          newState.combatLog.push('💥 Critical Strike! Triple damage!');
        }
        
        if (newState.adventureSkills.skillEffects.doubleStrikeActive) {
          damage *= 2;
          newState.combatLog.push('⚔️ Double Strike! Attack hits twice!');
        }

        // Deal damage to enemy
        newState.currentEnemy.hp = Math.max(0, newState.currentEnemy.hp - damage);
        newState.combatLog.push(`You deal ${damage} damage to the ${newState.currentEnemy.name}!`);

        // Healing aura effect
        if (newState.adventureSkills.skillEffects.healingAuraActive) {
          const healing = 15;
          newState.playerStats.hp = Math.min(newState.playerStats.maxHp, newState.playerStats.hp + healing);
          newState.combatLog.push(`🌟 Healing Aura restores ${healing} HP!`);
        }

        // Update knowledge streak
        newState.knowledgeStreak.current += 1;
        if (newState.knowledgeStreak.current > newState.knowledgeStreak.best) {
          newState.knowledgeStreak.best = newState.knowledgeStreak.current;
        }
        newState.knowledgeStreak.multiplier = 1 + (newState.knowledgeStreak.current * 0.1);

        // Update statistics
        newState.statistics.correctAnswers += 1;
        if (category) {
          if (!newState.statistics.accuracyByCategory[category]) {
            newState.statistics.accuracyByCategory[category] = { correct: 0, total: 0 };
          }
          newState.statistics.accuracyByCategory[category].correct += 1;
          newState.statistics.accuracyByCategory[category].total += 1;
        }
      } else {
        // Player missed - enemy attacks
        if (!newState.adventureSkills.skillEffects.dodgeUsed && !newState.adventureSkills.skillEffects.metalShieldUsed) {
          enemyDamage = Math.max(1, newState.currentEnemy.atk - newState.playerStats.def);
          
          // Apply shield wall effect
          if (newState.adventureSkills.skillEffects.shieldWallActive) {
            enemyDamage = Math.floor(enemyDamage * 0.5);
            newState.combatLog.push('🛡️ Shield Wall reduces damage!');
          }
          
          newState.playerStats.hp = Math.max(0, newState.playerStats.hp - enemyDamage);
          newState.combatLog.push(`The ${newState.currentEnemy.name} deals ${enemyDamage} damage to you!`);
        } else if (newState.adventureSkills.skillEffects.dodgeUsed) {
          newState.combatLog.push('🏃 Dodge activated! No damage taken!');
          newState.adventureSkills.skillEffects.dodgeUsed = false;
        } else if (newState.adventureSkills.skillEffects.metalShieldUsed) {
          newState.combatLog.push('🛡️ Metal Shield blocks the attack!');
          newState.adventureSkills.skillEffects.metalShieldUsed = false;
        }

        // Reset knowledge streak
        newState.knowledgeStreak.current = 0;
        newState.knowledgeStreak.multiplier = 1;

        // Update statistics
        if (category) {
          if (!newState.statistics.accuracyByCategory[category]) {
            newState.statistics.accuracyByCategory[category] = { correct: 0, total: 0 };
          }
          newState.statistics.accuracyByCategory[category].total += 1;
        }
      }

      newState.statistics.totalQuestionsAnswered += 1;

      // Check if enemy is defeated
      if (newState.currentEnemy.hp <= 0) {
        const baseCoins = 10 + (newState.zone * 2);
        const baseGems = Math.floor(newState.zone / 5) + 1;
        
        let coinsEarned = Math.floor(baseCoins * newState.knowledgeStreak.multiplier);
        let gemsEarned = Math.floor(baseGems * newState.knowledgeStreak.multiplier);

        // Apply game mode multipliers
        if (newState.gameMode.current === 'blitz') {
          coinsEarned = Math.floor(coinsEarned * 1.25);
          gemsEarned = Math.floor(gemsEarned * 1.1);
        } else if (newState.gameMode.current === 'survival') {
          coinsEarned *= 2;
          gemsEarned *= 2;
        }

        newState.coins += coinsEarned;
        newState.gems += gemsEarned;
        newState.zone += 1;
        newState.inCombat = false;
        newState.currentEnemy = null;
        
        // Check for premium status
        if (newState.zone >= 50) {
          newState.isPremium = true;
        }

        newState.combatLog.push(`Victory! You earned ${coinsEarned} coins and ${gemsEarned} gems!`);
        newState.statistics.totalVictories += 1;
        newState.statistics.coinsEarned += coinsEarned;
        newState.statistics.gemsEarned += gemsEarned;

        // Check for item drops
        if (newState.zone >= 10 && Math.random() < 0.3) {
          const isWeapon = Math.random() < 0.5;
          const item = isWeapon ? generateWeapon() : generateArmor();
          
          if (isWeapon) {
            newState.inventory.weapons.push(item as Weapon);
          } else {
            newState.inventory.armor.push(item as Armor);
          }
          
          newState.combatLog.push(`You found a ${item.name}!`);
          newState.statistics.itemsCollected += 1;
          
          // Update collection book
          const itemKey = item.name;
          if (isWeapon) {
            if (!newState.collectionBook.weapons[itemKey]) {
              newState.collectionBook.weapons[itemKey] = true;
              newState.collectionBook.totalWeaponsFound += 1;
            }
          } else {
            if (!newState.collectionBook.armor[itemKey]) {
              newState.collectionBook.armor[itemKey] = true;
              newState.collectionBook.totalArmorFound += 1;
            }
          }
          
          newState.collectionBook.rarityStats[item.rarity] += 1;
        }

        // Add experience
        const expGained = 10 + newState.zone;
        newState.progression.experience += expGained;
        
        // Check for level up
        while (newState.progression.experience >= newState.progression.experienceToNext) {
          newState.progression.experience -= newState.progression.experienceToNext;
          newState.progression.level += 1;
          newState.progression.skillPoints += 1;
          newState.progression.experienceToNext = Math.floor(100 * Math.pow(1.1, newState.progression.level - 1));
          newState.combatLog.push(`Level up! You are now level ${newState.progression.level}!`);
        }

        // Check achievements and player tags
        const newAchievements = checkAchievements(newState);
        const newTags = checkPlayerTags(newState);
        
        newState.achievements = newState.achievements.map(achievement => {
          const updated = newAchievements.find(a => a.id === achievement.id);
          return updated || achievement;
        });
        
        newState.playerTags = newState.playerTags.map(tag => {
          const updated = newTags.find(t => t.id === tag.id);
          return updated || tag;
        });

        // Reset adventure skills
        newState.adventureSkills = {
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
        };
      }

      // Check if player is defeated
      if (newState.playerStats.hp <= 0 && !newState.hasUsedRevival) {
        // Use revival
        newState.hasUsedRevival = true;
        newState.playerStats.hp = Math.floor(newState.playerStats.maxHp * 0.5);
        newState.combatLog.push('💖 You have been revived with 50% HP!');
        newState.statistics.revivals += 1;
      } else if (newState.playerStats.hp <= 0) {
        // Game over
        newState.inCombat = false;
        newState.currentEnemy = null;
        newState.combatLog.push('You have been defeated!');
        newState.statistics.totalDeaths += 1;
        
        // Reset to zone 1 and restore some HP
        newState.zone = 1;
        newState.playerStats.hp = Math.floor(newState.playerStats.maxHp * 0.25);
        
        // Reset adventure skills
        newState.adventureSkills = {
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
        };
      }

      return newState;
    });
  }, []);

  // Auction House functions
  const listItem = useCallback((itemId: string, itemType: 'weapon' | 'armor', startingBid: number, duration: number): boolean => {
    setGameState(prevState => {
      const items = itemType === 'weapon' ? prevState.inventory.weapons : prevState.inventory.armor;
      const item = items.find(i => i.id === itemId);
      
      if (!item) return prevState;
      
      const listing: AuctionListing = {
        id: `listing_${Date.now()}_${Math.random()}`,
        item,
        startingBid,
        currentBid: startingBid,
        highestBidder: null,
        timeRemaining: duration,
        endTime: new Date(Date.now() + duration * 60 * 1000),
        isPlayerListing: true,
        aiInterest: 'none',
        bids: []
      };
      
      return {
        ...prevState,
        auctionHouse: {
          ...prevState.auctionHouse,
          playerListings: [...prevState.auctionHouse.playerListings, listing]
        }
      };
    });
    return true;
  }, []);

  const placeBid = useCallback((listingId: string, bidAmount: number): boolean => {
    setGameState(prevState => {
      if (prevState.coins < bidAmount) return prevState;
      
      const listing = prevState.auctionHouse.aiListings.find(l => l.id === listingId);
      if (!listing || bidAmount <= listing.currentBid) return prevState;
      
      const bid: AuctionBid = {
        bidder: 'player',
        amount: bidAmount,
        timestamp: new Date()
      };
      
      return {
        ...prevState,
        coins: prevState.coins - bidAmount,
        auctionHouse: {
          ...prevState.auctionHouse,
          aiListings: prevState.auctionHouse.aiListings.map(l => 
            l.id === listingId 
              ? { ...l, currentBid: bidAmount, highestBidder: 'player', bids: [...l.bids, bid] }
              : l
          )
        }
      };
    });
    return true;
  }, []);

  const claimWonItem = useCallback((listingId: string): boolean => {
    setGameState(prevState => {
      const listing = prevState.auctionHouse.aiListings.find(l => l.id === listingId);
      if (!listing || listing.timeRemaining > 0 || listing.highestBidder !== 'player') return prevState;
      
      const item = listing.item;
      
      return {
        ...prevState,
        inventory: {
          ...prevState.inventory,
          weapons: 'baseAtk' in item 
            ? [...prevState.inventory.weapons, item as Weapon]
            : prevState.inventory.weapons,
          armor: 'baseDef' in item 
            ? [...prevState.inventory.armor, item as Armor]
            : prevState.inventory.armor
        },
        auctionHouse: {
          ...prevState.auctionHouse,
          aiListings: prevState.auctionHouse.aiListings.filter(l => l.id !== listingId)
        }
      };
    });
    return true;
  }, []);

  // Other existing functions (equipWeapon, equipArmor, etc.) would go here...
  // For brevity, I'm including just the essential ones for the auction house

  const equipWeapon = useCallback((weapon: Weapon) => {
    setGameState(prevState => ({
      ...prevState,
      inventory: {
        ...prevState.inventory,
        currentWeapon: weapon,
      },
      playerStats: {
        ...prevState.playerStats,
        atk: prevState.playerStats.baseAtk + weapon.baseAtk + (weapon.level - 1) * 10,
      },
    }));
  }, []);

  const equipArmor = useCallback((armor: Armor) => {
    setGameState(prevState => ({
      ...prevState,
      inventory: {
        ...prevState.inventory,
        currentArmor: armor,
      },
      playerStats: {
        ...prevState.playerStats,
        def: prevState.playerStats.baseDef + armor.baseDef + (armor.level - 1) * 5,
      },
    }));
  }, []);

  const upgradeWeapon = useCallback((weaponId: string) => {
    setGameState(prevState => {
      const weapon = prevState.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon || prevState.gems < weapon.upgradeCost) return prevState;

      const updatedWeapons = prevState.inventory.weapons.map(w =>
        w.id === weaponId ? { ...w, level: w.level + 1, upgradeCost: Math.floor(w.upgradeCost * 1.5) } : w
      );

      return {
        ...prevState,
        gems: prevState.gems - weapon.upgradeCost,
        inventory: {
          ...prevState.inventory,
          weapons: updatedWeapons,
        },
        statistics: {
          ...prevState.statistics,
          itemsUpgraded: prevState.statistics.itemsUpgraded + 1,
        },
      };
    });
  }, []);

  const upgradeArmor = useCallback((armorId: string) => {
    setGameState(prevState => {
      const armor = prevState.inventory.armor.find(a => a.id === armorId);
      if (!armor || prevState.gems < armor.upgradeCost) return prevState;

      const updatedArmor = prevState.inventory.armor.map(a =>
        a.id === armorId ? { ...a, level: a.level + 1, upgradeCost: Math.floor(a.upgradeCost * 1.5) } : a
      );

      return {
        ...prevState,
        gems: prevState.gems - armor.upgradeCost,
        inventory: {
          ...prevState.inventory,
          armor: updatedArmor,
        },
        statistics: {
          ...prevState.statistics,
          itemsUpgraded: prevState.statistics.itemsUpgraded + 1,
        },
      };
    });
  }, []);

  const sellWeapon = useCallback((weaponId: string) => {
    setGameState(prevState => {
      const weapon = prevState.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon) return prevState;

      return {
        ...prevState,
        coins: prevState.coins + weapon.sellPrice,
        inventory: {
          ...prevState.inventory,
          weapons: prevState.inventory.weapons.filter(w => w.id !== weaponId),
        },
        statistics: {
          ...prevState.statistics,
          itemsSold: prevState.statistics.itemsSold + 1,
        },
      };
    });
  }, []);

  const sellArmor = useCallback((armorId: string) => {
    setGameState(prevState => {
      const armor = prevState.inventory.armor.find(a => a.id === armorId);
      if (!armor) return prevState;

      return {
        ...prevState,
        coins: prevState.coins + armor.sellPrice,
        inventory: {
          ...prevState.inventory,
          armor: prevState.inventory.armor.filter(a => a.id !== armorId),
        },
        statistics: {
          ...prevState.statistics,
          itemsSold: prevState.statistics.itemsSold + 1,
        },
      };
    });
  }, []);

  const upgradeResearch = useCallback((type: 'atk' | 'def' | 'hp') => {
    setGameState(prevState => {
      const cost = calculateResearchCost(prevState.research.level);
      if (prevState.coins < cost) return prevState;

      const newLevel = prevState.research.level + 1;
      const bonus = calculateResearchBonus(newLevel);

      return {
        ...prevState,
        coins: prevState.coins - cost,
        research: {
          ...prevState.research,
          level: newLevel,
          totalSpent: prevState.research.totalSpent + cost,
        },
        playerStats: {
          ...prevState.playerStats,
          [type === 'atk' ? 'baseAtk' : type === 'def' ? 'baseDef' : 'baseHp']: 
            prevState.playerStats[type === 'atk' ? 'baseAtk' : type === 'def' ? 'baseDef' : 'baseHp'] + 10,
        },
        statistics: {
          ...prevState.statistics,
          totalResearchSpent: prevState.statistics.totalResearchSpent + cost,
        },
      };
    });
  }, []);

  const openChest = useCallback((cost: number): ChestReward | null => {
    if (gameState.coins < cost) return null;

    setGameState(prevState => {
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

      const isWeapon = Math.random() < 0.5;
      const item = isWeapon ? generateWeapon(false, rarity) : generateArmor(false, rarity);

      return {
        ...prevState,
        coins: prevState.coins - cost,
        gems: prevState.gems + Math.floor(Math.random() * 10) + 5,
        inventory: {
          ...prevState.inventory,
          weapons: isWeapon ? [...prevState.inventory.weapons, item as Weapon] : prevState.inventory.weapons,
          armor: !isWeapon ? [...prevState.inventory.armor, item as Armor] : prevState.inventory.armor,
        },
        statistics: {
          ...prevState.statistics,
          chestsOpened: prevState.statistics.chestsOpened + 1,
          itemsCollected: prevState.statistics.itemsCollected + 1,
        },
      };
    });

    return {
      type: 'weapon',
      items: [],
    };
  }, [gameState.coins]);

  const discardItem = useCallback((itemId: string, type: 'weapon' | 'armor') => {
    setGameState(prevState => ({
      ...prevState,
      inventory: {
        ...prevState.inventory,
        weapons: type === 'weapon' 
          ? prevState.inventory.weapons.filter(w => w.id !== itemId)
          : prevState.inventory.weapons,
        armor: type === 'armor' 
          ? prevState.inventory.armor.filter(a => a.id !== itemId)
          : prevState.inventory.armor,
      },
    }));
  }, []);

  const purchaseMythical = useCallback((cost: number): boolean => {
    if (gameState.coins < cost) return false;

    setGameState(prevState => {
      const isWeapon = Math.random() < 0.5;
      const item = isWeapon ? generateWeapon(false, 'mythical') : generateArmor(false, 'mythical');

      return {
        ...prevState,
        coins: prevState.coins - cost,
        inventory: {
          ...prevState.inventory,
          weapons: isWeapon ? [...prevState.inventory.weapons, item as Weapon] : prevState.inventory.weapons,
          armor: !isWeapon ? [...prevState.inventory.armor, item as Armor] : prevState.inventory.armor,
        },
      };
    });

    return true;
  }, [gameState.coins]);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  const setGameMode = useCallback((mode: 'normal' | 'blitz' | 'bloodlust' | 'survival') => {
    setGameState(prevState => ({
      ...prevState,
      gameMode: {
        ...prevState.gameMode,
        current: mode,
        survivalLives: mode === 'survival' ? 3 : prevState.gameMode.survivalLives,
      },
    }));
  }, []);

  const toggleCheat = useCallback((cheat: keyof typeof gameState.cheats) => {
    setGameState(prevState => ({
      ...prevState,
      cheats: {
        ...prevState.cheats,
        [cheat]: !prevState.cheats[cheat],
      },
    }));
  }, []);

  const generateCheatItem = useCallback(() => {
    // Implementation for generating cheat items
  }, []);

  const mineGem = useCallback((x: number, y: number) => {
    const isShiny = Math.random() < 0.05;
    const gems = isShiny ? 0 : 1;
    const shinyGems = isShiny ? 1 : 0;

    setGameState(prevState => ({
      ...prevState,
      gems: prevState.gems + gems,
      shinyGems: prevState.shinyGems + shinyGems,
      mining: {
        ...prevState.mining,
        totalGemsMined: prevState.mining.totalGemsMined + gems,
        totalShinyGemsMined: prevState.mining.totalShinyGemsMined + shinyGems,
      },
    }));

    return { gems, shinyGems };
  }, []);

  const exchangeShinyGems = useCallback((amount: number): boolean => {
    if (gameState.shinyGems < amount) return false;

    setGameState(prevState => ({
      ...prevState,
      shinyGems: prevState.shinyGems - amount,
      gems: prevState.gems + (amount * 10),
    }));

    return true;
  }, [gameState.shinyGems]);

  const purchaseRelic = useCallback((relicId: string): boolean => {
    setGameState(prevState => {
      const relic = prevState.yojefMarket.items.find(item => item.id === relicId);
      if (!relic || prevState.gems < relic.cost) return prevState;

      return {
        ...prevState,
        gems: prevState.gems - relic.cost,
        inventory: {
          ...prevState.inventory,
          relics: [...prevState.inventory.relics, relic],
        },
        yojefMarket: {
          ...prevState.yojefMarket,
          items: prevState.yojefMarket.items.filter(item => item.id !== relicId),
        },
      };
    });

    return true;
  }, []);

  const upgradeRelic = useCallback((relicId: string) => {
    setGameState(prevState => {
      const relic = prevState.inventory.relics.find(r => r.id === relicId);
      if (!relic || prevState.gems < relic.upgradeCost) return prevState;

      const updatedRelics = prevState.inventory.relics.map(r =>
        r.id === relicId ? { ...r, level: r.level + 1, upgradeCost: Math.floor(r.upgradeCost * 1.5) } : r
      );

      return {
        ...prevState,
        gems: prevState.gems - relic.upgradeCost,
        inventory: {
          ...prevState.inventory,
          relics: updatedRelics,
        },
      };
    });
  }, []);

  const equipRelic = useCallback((relicId: string) => {
    setGameState(prevState => {
      const relic = prevState.inventory.relics.find(r => r.id === relicId);
      if (!relic || prevState.inventory.equippedRelics.length >= 5) return prevState;

      return {
        ...prevState,
        inventory: {
          ...prevState.inventory,
          equippedRelics: [...prevState.inventory.equippedRelics, relic],
        },
      };
    });
  }, []);

  const unequipRelic = useCallback((relicId: string) => {
    setGameState(prevState => ({
      ...prevState,
      inventory: {
        ...prevState.inventory,
        equippedRelics: prevState.inventory.equippedRelics.filter(r => r.id !== relicId),
      },
    }));
  }, []);

  const sellRelic = useCallback((relicId: string) => {
    setGameState(prevState => ({
      ...prevState,
      inventory: {
        ...prevState.inventory,
        relics: prevState.inventory.relics.filter(r => r.id !== relicId),
      },
    }));
  }, []);

  const claimDailyReward = useCallback((): boolean => {
    setGameState(prevState => {
      if (!prevState.dailyRewards.availableReward) return prevState;

      const reward = prevState.dailyRewards.availableReward;
      
      return {
        ...prevState,
        coins: prevState.coins + reward.coins,
        gems: prevState.gems + reward.gems,
        dailyRewards: {
          ...prevState.dailyRewards,
          availableReward: null,
          lastClaimDate: new Date(),
          rewardHistory: [...prevState.dailyRewards.rewardHistory, { ...reward, claimed: true, claimDate: new Date() }],
        },
      };
    });

    return true;
  }, []);

  const upgradeSkill = useCallback((skillId: string): boolean => {
    setGameState(prevState => {
      if (prevState.progression.skillPoints <= 0) return prevState;

      return {
        ...prevState,
        progression: {
          ...prevState.progression,
          skillPoints: prevState.progression.skillPoints - 1,
          unlockedSkills: [...prevState.progression.unlockedSkills, skillId],
        },
      };
    });

    return true;
  }, []);

  const prestige = useCallback((): boolean => {
    setGameState(prevState => {
      if (prevState.progression.level < 50) return prevState;

      const prestigePoints = Math.floor(prevState.progression.level / 10);

      return {
        ...prevState,
        progression: {
          ...prevState.progression,
          level: 1,
          experience: 0,
          experienceToNext: 100,
          skillPoints: 0,
          prestigeLevel: prevState.progression.prestigeLevel + 1,
          prestigePoints: prevState.progression.prestigePoints + prestigePoints,
        },
      };
    });

    return true;
  }, []);

  const claimOfflineRewards = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      coins: prevState.coins + prevState.offlineProgress.offlineCoins,
      gems: prevState.gems + prevState.offlineProgress.offlineGems,
      offlineProgress: {
        ...prevState.offlineProgress,
        offlineCoins: 0,
        offlineGems: 0,
        offlineTime: 0,
      },
    }));
  }, []);

  const bulkSell = useCallback((itemIds: string[], type: 'weapon' | 'armor') => {
    setGameState(prevState => {
      const items = type === 'weapon' ? prevState.inventory.weapons : prevState.inventory.armor;
      const itemsToSell = items.filter(item => itemIds.includes(item.id));
      const totalValue = itemsToSell.reduce((sum, item) => sum + item.sellPrice, 0);

      return {
        ...prevState,
        coins: prevState.coins + totalValue,
        inventory: {
          ...prevState.inventory,
          weapons: type === 'weapon' 
            ? prevState.inventory.weapons.filter(w => !itemIds.includes(w.id))
            : prevState.inventory.weapons,
          armor: type === 'armor' 
            ? prevState.inventory.armor.filter(a => !itemIds.includes(a.id))
            : prevState.inventory.armor,
        },
      };
    });
  }, []);

  const bulkUpgrade = useCallback((itemIds: string[], type: 'weapon' | 'armor') => {
    setGameState(prevState => {
      const items = type === 'weapon' ? prevState.inventory.weapons : prevState.inventory.armor;
      const itemsToUpgrade = items.filter(item => itemIds.includes(item.id));
      const totalCost = itemsToUpgrade.reduce((sum, item) => sum + item.upgradeCost, 0);

      if (prevState.gems < totalCost) return prevState;

      return {
        ...prevState,
        gems: prevState.gems - totalCost,
        inventory: {
          ...prevState.inventory,
          weapons: type === 'weapon' 
            ? prevState.inventory.weapons.map(w => 
                itemIds.includes(w.id) 
                  ? { ...w, level: w.level + 1, upgradeCost: Math.floor(w.upgradeCost * 1.5) }
                  : w
              )
            : prevState.inventory.weapons,
          armor: type === 'armor' 
            ? prevState.inventory.armor.map(a => 
                itemIds.includes(a.id) 
                  ? { ...a, level: a.level + 1, upgradeCost: Math.floor(a.upgradeCost * 1.5) }
                  : a
              )
            : prevState.inventory.armor,
        },
      };
    });
  }, []);

  const plantSeed = useCallback((): boolean => {
    setGameState(prevState => {
      if (prevState.coins < prevState.gardenOfGrowth.seedCost || prevState.gardenOfGrowth.isPlanted) {
        return prevState;
      }

      return {
        ...prevState,
        coins: prevState.coins - prevState.gardenOfGrowth.seedCost,
        gardenOfGrowth: {
          ...prevState.gardenOfGrowth,
          isPlanted: true,
          plantedAt: new Date(),
          lastWatered: new Date(),
          waterHoursRemaining: 24,
        },
      };
    });

    return true;
  }, []);

  const buyWater = useCallback((hours: number): boolean => {
    setGameState(prevState => {
      const cost = Math.floor((hours / 24) * prevState.gardenOfGrowth.waterCost);
      
      if (prevState.coins < cost) return prevState;

      return {
        ...prevState,
        coins: prevState.coins - cost,
        gardenOfGrowth: {
          ...prevState.gardenOfGrowth,
          waterHoursRemaining: prevState.gardenOfGrowth.waterHoursRemaining + hours,
          lastWatered: new Date(),
        },
      };
    });

    return true;
  }, []);

  const updateSettings = useCallback((settings: Partial<typeof gameState.settings>) => {
    setGameState(prevState => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        ...settings,
      },
    }));
  }, []);

  const addCoins = useCallback((amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      coins: prevState.coins + amount,
    }));
  }, []);

  const addGems = useCallback((amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      gems: prevState.gems + amount,
    }));
  }, []);

  const teleportToZone = useCallback((zone: number) => {
    setGameState(prevState => ({
      ...prevState,
      zone: Math.max(1, zone),
    }));
  }, []);

  const setExperience = useCallback((xp: number) => {
    setGameState(prevState => ({
      ...prevState,
      progression: {
        ...prevState.progression,
        experience: Math.max(0, xp),
      },
    }));
  }, []);

  const rollSkill = useCallback((): boolean => {
    setGameState(prevState => {
      if (prevState.coins < 100) return prevState;

      // Generate random skill
      const skillTypes = [
        'coin_vacuum', 'treasurer', 'xp_surge', 'luck_gem', 'enchanter',
        'time_warp', 'golden_touch', 'knowledge_boost', 'durability_master',
        'relic_finder', 'stat_amplifier', 'question_master', 'gem_magnet',
        'streak_guardian', 'revival_blessing', 'zone_skipper', 'item_duplicator',
        'research_accelerator', 'garden_booster', 'market_refresh',
        'mega_multiplier', 'instant_heal', 'perfect_accuracy', 'treasure_magnet',
        'skill_cooldown', 'auto_upgrade', 'legendary_luck', 'time_freeze',
        'double_rewards', 'infinite_energy'
      ];

      const randomType = skillTypes[Math.floor(Math.random() * skillTypes.length)];
      const duration = Math.floor(Math.random() * 24) + 1; // 1-24 hours

      const skill: MenuSkill = {
        id: `skill_${Date.now()}`,
        name: randomType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: 'A powerful temporary ability',
        duration,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000),
        type: randomType as any,
      };

      return {
        ...prevState,
        coins: prevState.coins - 100,
        skills: {
          ...prevState.skills,
          activeMenuSkill: skill,
          lastRollTime: new Date(),
        },
      };
    });

    return true;
  }, []);

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
    listItem,
    placeBid,
    claimWonItem,
  };
};