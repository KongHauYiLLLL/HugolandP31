import React, { useState, Suspense } from 'react';
import { useGameState } from './hooks/useGameState';
import { Combat } from './components/Combat';
import { Shop } from './components/Shop';
import { Inventory } from './components/Inventory';
import { PlayerStats } from './components/PlayerStats';
import { Research } from './components/Research';
import { Mining } from './components/Mining';
import { FloatingIcons } from './components/FloatingIcons';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { EnhancedButton } from './components/EnhancedButton';
import { TypingInterface } from './components/TypingInterface';
import { Shield, Package, User, Play, RotateCcw, Brain, Crown, Gift, Pickaxe, Menu, ArrowLeft } from 'lucide-react';

// Lazy load heavy components
import {
  LazyStatistics,
  LazyAchievements,
  LazyCollectionBook,
  LazyEnhancedGameModes,
  LazyPokyegMarket,
  LazyTutorial,
  LazyCheatPanel,
  LazyDailyRewards,
  LazyOfflineProgress,
  LazyBulkActions,
  LazyHamburgerMenuPage,
  LazyGardenOfGrowth,
  LazyGameSettings,
  LazyDevTools,
  LazySkills,
  LazyYojefMarket,
  LazyProgressionPanel,
  LazyAdventureSkillSelection
} from './components/LazyComponents';

type GameView = 'stats' | 'shop' | 'inventory' | 'research' | 'mining' | 'menu';
type ModalView = 'collection' | 'gameMode' | 'pokyegMarket' | 'tutorial' | 'cheats' | 'resetConfirm' | 'dailyRewards' | 'offlineProgress' | 'bulkActions' | null;

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="animate-spin inline-block w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mb-4"></div>
      <p className="text-white text-lg font-semibold">Loading...</p>
    </div>
  </div>
);

function App() {
  const {
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
  } = useGameState();

  const [currentView, setCurrentView] = useState<GameView>('stats');
  const [currentModal, setCurrentModal] = useState<ModalView>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mb-6"></div>
          <p className="text-white text-xl font-semibold">Loading Hugoland...</p>
          <p className="text-purple-300 text-sm mt-2">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  // Show adventure skill selection modal - FIXED: Check for both conditions properly
  if (gameState?.adventureSkills?.showSelectionModal && gameState.adventureSkills.availableSkills.length > 0 && !gameState.inCombat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <FloatingIcons />
        <TypingInterface beautyMode={gameState.settings.beautyMode}>
          <Suspense fallback={<LoadingSpinner />}>
            <LazyAdventureSkillSelection
              availableSkills={gameState.adventureSkills.availableSkills}
              onSelectSkill={selectAdventureSkill}
              onSkipSkills={skipAdventureSkills}
            />
          </Suspense>
        </TypingInterface>
      </div>
    );
  }

  // ONLY show modals if NOT in combat
  if (!gameState.inCombat) {
    // Show offline progress modal if there are rewards
    if (gameState.offlineProgress.offlineCoins > 0 || gameState.offlineProgress.offlineGems > 0) {
      if (currentModal !== 'offlineProgress') {
        setCurrentModal('offlineProgress');
      }
    }
    // Show daily rewards modal if available (only after offline progress is handled)
    else if (gameState.dailyRewards.availableReward && currentModal !== 'dailyRewards') {
      setCurrentModal('dailyRewards');
    }
  }

  // Show welcome screen for new players
  if (showWelcome && gameState.zone === 1 && gameState.coins === 500) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <FloatingIcons />
        <TypingInterface beautyMode={gameState.settings.beautyMode}>
          <div className="text-center max-w-lg mx-auto relative z-10">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                🏰 Welcome to<br />Hugoland! 🗡️
              </h1>
              <p className="text-purple-300 text-lg sm:text-xl mb-8 leading-relaxed">
                The ultimate fantasy adventure game where knowledge is your greatest weapon!
              </p>
              
              <div className={`bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 mb-8 ${gameState.settings.beautyMode ? 'shadow-2xl border-2 border-purple-400/50' : ''}`}>
                <h3 className="text-white font-bold mb-4 text-lg">🎮 What awaits you:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-purple-200">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">•</span>
                    <span>Answer trivia questions to defeat enemies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Collect powerful weapons and armor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Mine gems and find rare treasures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Unlock achievements and streaks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">•</span>
                    <span>Explore multiple game modes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Progress through infinite zones</span>
                  </div>
                </div>
              </div>
            </div>
            
            <EnhancedButton
              onClick={() => setShowWelcome(false)}
              variant="primary"
              size="lg"
              beautyMode={gameState.settings.beautyMode}
              className="w-full sm:w-auto flex items-center gap-3 justify-center"
            >
              <Play className="w-6 h-6" />
              Start Your Adventure
            </EnhancedButton>
            
            <p className="text-gray-400 text-sm mt-4">
              Begin your journey in the magical world of Hugoland
            </p>
          </div>
        </TypingInterface>
      </div>
    );
  }

  const handleResetGame = () => {
    setCurrentModal('resetConfirm');
  };

  const confirmReset = () => {
    resetGame();
    setCurrentModal(null);
  };

  const renderCurrentView = () => {
    if (gameState.inCombat && gameState.currentEnemy) {
      return (
        <Combat
          enemy={gameState.currentEnemy}
          playerStats={gameState.playerStats}
          onAttack={attack}
          combatLog={gameState.combatLog}
          gameMode={gameState.gameMode}
          knowledgeStreak={gameState.knowledgeStreak}
          hasUsedRevival={gameState.hasUsedRevival}
          adventureSkills={gameState.adventureSkills}
          onUseSkipCard={useSkipCard}
        />
      );
    }

    switch (currentView) {
      case 'menu':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyHamburgerMenuPage
              gameState={gameState}
              onPlantSeed={plantSeed}
              onBuyWater={buyWater}
              onUpgradeSkill={upgradeSkill}
              onPrestige={prestige}
              onUpdateSettings={updateSettings}
              onAddCoins={addCoins}
              onAddGems={addGems}
              onTeleportToZone={teleportToZone}
              onSetExperience={setExperience}
              onRollSkill={rollSkill}
              onPurchaseRelic={purchaseRelic}
              onListItem={listItem}
              onPlaceBid={placeBid}
              onClaimWonItem={claimWonItem}
              onBack={() => setCurrentView('stats')}
            />
          </Suspense>
        );
      case 'stats':
        return (
          <TypingInterface beautyMode={gameState.settings.beautyMode}>
            <div className="space-y-6">
              <PlayerStats
                playerStats={gameState.playerStats}
                zone={gameState.zone}
                coins={gameState.coins}
                gems={gameState.gems}
                shinyGems={gameState.shinyGems}
                playerTags={gameState.playerTags}
                progression={gameState.progression}
              />

              {/* Garden Status */}
              {gameState.gardenOfGrowth.isPlanted && (
                <div className={`bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-4 sm:p-6 rounded-xl border border-green-500/50 backdrop-blur-sm ${gameState.settings.beautyMode ? 'shadow-xl' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <span className="text-2xl">🌱</span>
                      Garden of Growth
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center bg-black/20 p-3 rounded-lg">
                      <p className="text-green-300 font-semibold text-sm">Growth</p>
                      <p className="text-white text-xl font-bold">{gameState.gardenOfGrowth.growthCm.toFixed(1)}cm</p>
                    </div>
                    <div className="text-center bg-black/20 p-3 rounded-lg">
                      <p className="text-blue-300 font-semibold text-sm">Stat Bonus</p>
                      <p className="text-white text-xl font-bold">+{gameState.gardenOfGrowth.totalGrowthBonus.toFixed(1)}%</p>
                    </div>
                    <div className="text-center bg-black/20 p-3 rounded-lg">
                      <p className="text-cyan-300 font-semibold text-sm">Water Left</p>
                      <p className="text-white text-xl font-bold">{gameState.gardenOfGrowth.waterHoursRemaining.toFixed(1)}h</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((gameState.gardenOfGrowth.growthCm / gameState.gardenOfGrowth.maxGrowthCm) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-center text-gray-300 text-sm mt-2">
                      Progress to maximum growth ({gameState.gardenOfGrowth.maxGrowthCm}cm)
                    </p>
                  </div>
                </div>
              )}
              
              {/* Knowledge Streak Display */}
              {gameState.knowledgeStreak.current > 0 && (
                <div className={`bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-4 sm:p-6 rounded-xl border border-yellow-500/50 backdrop-blur-sm ${gameState.settings.beautyMode ? 'shadow-xl' : ''}`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span className="text-3xl animate-pulse">🔥</span>
                      <h3 className="text-yellow-400 font-bold text-xl">Knowledge Streak!</h3>
                    </div>
                    <p className="text-white text-lg mb-2">
                      {gameState.knowledgeStreak.current} correct answers in a row
                    </p>
                    <p className="text-yellow-300 font-semibold">
                      +{Math.round((gameState.knowledgeStreak.multiplier - 1) * 100)}% reward bonus
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center space-y-6">
                <EnhancedButton
                  onClick={startCombat}
                  disabled={gameState.playerStats.hp <= 0 || (gameState.gameMode.current === 'survival' && gameState.gameMode.survivalLives <= 0)}
                  variant={gameState.playerStats.hp > 0 && (gameState.gameMode.current !== 'survival' || gameState.gameMode.survivalLives > 0) ? 'success' : 'secondary'}
                  size="lg"
                  beautyMode={gameState.settings.beautyMode}
                  className="w-full sm:w-auto flex items-center gap-3 justify-center"
                >
                  <Play className="w-6 h-6" />
                  {gameState.playerStats.hp <= 0 
                    ? 'You are defeated!' 
                    : gameState.gameMode.current === 'survival' && gameState.gameMode.survivalLives <= 0
                      ? 'No lives remaining!'
                      : 'Start Adventure'}
                </EnhancedButton>
                
                {(gameState.playerStats.hp <= 0 || (gameState.gameMode.current === 'survival' && gameState.gameMode.survivalLives <= 0)) && (
                  <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/50">
                    <p className="text-red-400 text-sm">
                      {gameState.gameMode.current === 'survival' && gameState.gameMode.survivalLives <= 0
                        ? 'Change game mode or reset to continue!'
                        : 'Visit the shop to get better equipment and try again!'}
                    </p>
                  </div>
                )}
                
                {gameState.isPremium && (
                  <div className={`bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 p-4 rounded-xl border border-yellow-500/50 backdrop-blur-sm ${gameState.settings.beautyMode ? 'shadow-xl' : ''}`}>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <span className="text-white font-bold text-lg">🎉 PREMIUM MEMBER! 🎉</span>
                    </div>
                    <p className="text-yellow-100 text-sm">
                      You've reached Zone 50! Enjoy exclusive rewards and special features!
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap justify-center gap-3">
                  <EnhancedButton
                    onClick={() => setCurrentModal('gameMode')}
                    variant="primary"
                    size="sm"
                    beautyMode={gameState.settings.beautyMode}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline">Game Mode</span>
                  </EnhancedButton>
                  
                  <EnhancedButton
                    onClick={() => setCurrentModal('dailyRewards')}
                    variant="success"
                    size="sm"
                    beautyMode={gameState.settings.beautyMode}
                    className="flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span className="hidden sm:inline">Daily Rewards</span>
                  </EnhancedButton>
                  
                  <EnhancedButton
                    onClick={handleResetGame}
                    variant="danger"
                    size="sm"
                    beautyMode={gameState.settings.beautyMode}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset Game</span>
                  </EnhancedButton>
                </div>
              </div>
            </div>
          </TypingInterface>
        );
      case 'shop':
        return <Shop coins={gameState.coins} onOpenChest={openChest} onDiscardItem={discardItem} isPremium={gameState.isPremium} />;
      case 'inventory':
        return (
          <Inventory
            inventory={gameState.inventory}
            gems={gameState.gems}
            coins={gameState.coins}
            auctionHouse={gameState.auctionHouse}
            onEquipWeapon={equipWeapon}
            onEquipArmor={equipArmor}
            onUpgradeWeapon={upgradeWeapon}
            onUpgradeArmor={upgradeArmor}
            onSellWeapon={sellWeapon}
            onSellArmor={sellArmor}
            onUpgradeRelic={upgradeRelic}
            onEquipRelic={equipRelic}
            onUnequipRelic={unequipRelic}
            onSellRelic={sellRelic}
            onListItem={listItem}
            onPlaceBid={placeBid}
            onClaimWonItem={claimWonItem}
            beautyMode={gameState.settings.beautyMode}
          />
        );
      case 'research':
        return (
          <Research
            research={gameState.research}
            coins={gameState.coins}
            onUpgradeResearch={upgradeResearch}
            isPremium={gameState.isPremium}
          />
        );
      case 'mining':
        return (
          <Mining
            mining={gameState.mining}
            gems={gameState.gems}
            shinyGems={gameState.shinyGems}
            onMineGem={mineGem}
            onExchangeShinyGems={exchangeShinyGems}
          />
        );
      default:
        return null;
    }
  };

  const renderModal = () => {
    // Don't show any modals during combat except for reset confirmation
    if (gameState.inCombat && currentModal !== 'resetConfirm') {
      return null;
    }

    switch (currentModal) {
      case 'collection':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyCollectionBook
              collectionBook={gameState.collectionBook}
              allWeapons={gameState.inventory.weapons}
              allArmor={gameState.inventory.armor}
              onClose={() => setCurrentModal(null)}
            />
          </Suspense>
        );
      case 'gameMode':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyEnhancedGameModes
              currentMode={gameState.gameMode}
              onSelectMode={setGameMode}
              onClose={() => setCurrentModal(null)}
            />
          </Suspense>
        );
      case 'pokyegMarket':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyPokyegMarket
              coins={gameState.coins}
              onPurchaseMythical={purchaseMythical}
              onClose={() => setCurrentModal(null)}
            />
          </Suspense>
        );
      case 'tutorial':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyTutorial
              onClose={() => setCurrentModal(null)}
            />
          </Suspense>
        );
      case 'cheats':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyCheatPanel
              cheats={gameState.cheats}
              onToggleCheat={toggleCheat}
              onGenerateItem={generateCheatItem}
              onClose={() => setCurrentModal(null)}
            />
          </Suspense>
        );
      case 'dailyRewards':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyDailyRewards
              dailyRewards={gameState.dailyRewards}
              onClaimReward={claimDailyReward}
              onClose={() => setCurrentModal(null)}
            />
          </Suspense>
        );
      case 'offlineProgress':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyOfflineProgress
              offlineProgress={gameState.offlineProgress}
              onClaimOfflineRewards={claimOfflineRewards}
              onClose={() => setCurrentModal(null)}
            />
          </Suspense>
        );
      case 'bulkActions':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyBulkActions
              weapons={gameState.inventory.weapons}
              armor={gameState.inventory.armor}
              gems={gameState.gems}
              onBulkSell={bulkSell}
              onBulkUpgrade={bulkUpgrade}
              onClose={() => setCurrentModal(null)}
            />
          </Suspense>
        );
      case 'resetConfirm':
        return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <TypingInterface beautyMode={gameState.settings.beautyMode}>
              <div className={`bg-gradient-to-br from-red-900 to-gray-900 p-6 rounded-xl border border-red-500/50 max-w-md w-full backdrop-blur-sm ${gameState.settings.beautyMode ? 'shadow-2xl border-2 border-red-400/50' : ''}`}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RotateCcw className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-white font-bold text-xl mb-4">Reset Game?</h2>
                  <p className="text-gray-300 text-sm mb-6">
                    Are you sure you want to reset your game? This will permanently delete all your progress.
                  </p>
                  <div className="bg-black/30 p-3 rounded-lg mb-6 text-left">
                    <p className="text-red-400 font-bold text-sm mb-2">This action cannot be undone!</p>
                    <ul className="text-red-300 text-xs space-y-1">
                      <li>• All coins, gems, and items will be lost</li>
                      <li>• Zone progress and achievements will be reset</li>
                      <li>• Research levels and statistics will be cleared</li>
                      <li>• Character level and skills will be reset</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <EnhancedButton
                      onClick={() => setCurrentModal(null)}
                      variant="secondary"
                      beautyMode={gameState.settings.beautyMode}
                      className="flex-1"
                    >
                      Cancel
                    </EnhancedButton>
                    <EnhancedButton
                      onClick={confirmReset}
                      variant="danger"
                      beautyMode={gameState.settings.beautyMode}
                      className="flex-1"
                    >
                      Reset Game
                    </EnhancedButton>
                  </div>
                </div>
              </div>
            </TypingInterface>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <FloatingIcons />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Header */}
      <TypingInterface beautyMode={gameState.settings.beautyMode}>
        <div className={`bg-gradient-to-r from-purple-800 via-violet-800 to-purple-800 shadow-2xl relative z-10 border-b border-purple-500/30 ${gameState.settings.beautyMode ? 'shadow-purple-500/30' : ''}`}>
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  🏰 Hugoland 🗡️
                </h1>
                {gameState.isPremium && (
                  <Crown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-400 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Only show bulk actions button when not in combat and not on menu page */}
                {!gameState.inCombat && currentView !== 'menu' && (
                  <EnhancedButton
                    onClick={() => setCurrentModal('bulkActions')}
                    variant="primary"
                    size="sm"
                    beautyMode={gameState.settings.beautyMode}
                    className="flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">Bulk</span>
                  </EnhancedButton>
                )}
                {/* Hamburger Menu Button */}
                <EnhancedButton
                  onClick={() => setCurrentView('menu')}
                  variant="secondary"
                  size="sm"
                  beautyMode={gameState.settings.beautyMode}
                  className="flex items-center gap-2"
                >
                  <Menu className="w-4 h-4" />
                  <span className="hidden sm:inline">Menu</span>
                </EnhancedButton>
              </div>
            </div>
            
            {/* Quick Stats Bar - Hide during combat and on menu page */}
            {!gameState.inCombat && currentView !== 'menu' && (
              <div className="flex justify-center items-center gap-4 mb-4 text-sm">
                {gameState.dailyRewards.availableReward && (
                  <EnhancedButton
                    onClick={() => setCurrentModal('dailyRewards')}
                    variant="success"
                    size="sm"
                    beautyMode={gameState.settings.beautyMode}
                    className="flex items-center gap-2 animate-pulse"
                  >
                    <Gift className="w-4 h-4" />
                    <span className="hidden sm:inline">Daily Reward!</span>
                  </EnhancedButton>
                )}
              </div>
            )}
            
            {/* Navigation - Disable during combat and hide on menu page */}
            {currentView !== 'menu' && (
              <nav className="flex justify-center">
                <div className={`flex space-x-2 bg-black/20 p-2 rounded-xl backdrop-blur-sm border border-white/10 ${gameState.settings.beautyMode ? 'shadow-lg' : ''}`}>
                  {[
                    { id: 'stats', label: 'Hero', icon: User },
                    { id: 'research', label: 'Research', icon: Brain },
                    { id: 'shop', label: 'Shop', icon: Package },
                    { id: 'inventory', label: 'Inventory', icon: Shield },
                    { id: 'mining', label: 'Mining', icon: Pickaxe },
                  ].map(({ id, label, icon: Icon }) => (
                    <EnhancedButton
                      key={id}
                      onClick={() => setCurrentView(id as GameView)}
                      disabled={gameState.inCombat}
                      variant={currentView === id ? 'primary' : 'secondary'}
                      size="sm"
                      beautyMode={gameState.settings.beautyMode}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </EnhancedButton>
                  ))}
                </div>
              </nav>
            )}

            {/* Menu Page Back Button */}
            {currentView === 'menu' && (
              <div className="flex justify-center">
                <EnhancedButton
                  onClick={() => setCurrentView('stats')}
                  variant="primary"
                  beautyMode={gameState.settings.beautyMode}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Game
                </EnhancedButton>
              </div>
            )}
          </div>
        </div>
      </TypingInterface>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {renderCurrentView()}
        </div>
      </div>

      {/* Modals */}
      {renderModal()}
    </div>
  );
}

export default App;