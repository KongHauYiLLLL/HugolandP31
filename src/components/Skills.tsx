import React, { useState } from 'react';
import { SkillsSystem, MenuSkill } from '../types/game';
import { Zap, Clock, Coins, X, Dice6, Star, TrendingUp, Package, Sparkles, Timer, Crown, Brain, Shield, Gem, Leaf, RefreshCw, Shuffle, Copy, FastForward, Compass, Flame, Snowflake, Target, Rocket, Infinity, Battery } from 'lucide-react';
import { EnhancedButton } from './EnhancedButton';
import { TypingInterface } from './TypingInterface';

interface SkillsProps {
  skills: SkillsSystem;
  coins: number;
  onRollSkill: () => boolean;
  onClose: () => void;
  beautyMode?: boolean;
}

export const Skills: React.FC<SkillsProps> = ({
  skills,
  coins,
  onRollSkill,
  onClose,
  beautyMode = false
}) => {
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = async () => {
    setIsRolling(true);
    setTimeout(() => {
      const success = onRollSkill();
      setIsRolling(false);
      if (!success) {
        alert('Not enough coins!');
      }
    }, 1500);
  };

  const getSkillIcon = (type: string) => {
    switch (type) {
      case 'coin_vacuum': return <Coins className="w-6 h-6 text-yellow-400" />;
      case 'treasurer': return <Package className="w-6 h-6 text-purple-400" />;
      case 'xp_surge': return <TrendingUp className="w-6 h-6 text-blue-400" />;
      case 'luck_gem': return <Sparkles className="w-6 h-6 text-yellow-400" />;
      case 'enchanter': return <Star className="w-6 h-6 text-cyan-400" />;
      case 'time_warp': return <Timer className="w-6 h-6 text-purple-400" />;
      case 'golden_touch': return <Crown className="w-6 h-6 text-yellow-400" />;
      case 'knowledge_boost': return <Brain className="w-6 h-6 text-indigo-400" />;
      case 'durability_master': return <Shield className="w-6 h-6 text-green-400" />;
      case 'relic_finder': return <Gem className="w-6 h-6 text-purple-400" />;
      case 'stat_amplifier': return <Zap className="w-6 h-6 text-red-400" />;
      case 'question_master': return <Brain className="w-6 h-6 text-blue-500" />;
      case 'gem_magnet': return <Gem className="w-6 h-6 text-cyan-400" />;
      case 'streak_guardian': return <Star className="w-6 h-6 text-orange-400" />;
      case 'revival_blessing': return <Sparkles className="w-6 h-6 text-pink-400" />;
      case 'zone_skipper': return <Compass className="w-6 h-6 text-green-500" />;
      case 'item_duplicator': return <Copy className="w-6 h-6 text-violet-400" />;
      case 'research_accelerator': return <FastForward className="w-6 h-6 text-teal-400" />;
      case 'garden_booster': return <Leaf className="w-6 h-6 text-lime-400" />;
      case 'market_refresh': return <RefreshCw className="w-6 h-6 text-indigo-500" />;
      // New skills
      case 'mega_multiplier': return <Flame className="w-6 h-6 text-red-500" />;
      case 'instant_heal': return <Sparkles className="w-6 h-6 text-green-500" />;
      case 'perfect_accuracy': return <Target className="w-6 h-6 text-blue-600" />;
      case 'treasure_magnet': return <Gem className="w-6 h-6 text-gold-400" />;
      case 'skill_cooldown': return <Snowflake className="w-6 h-6 text-cyan-500" />;
      case 'auto_upgrade': return <Rocket className="w-6 h-6 text-orange-600" />;
      case 'legendary_luck': return <Crown className="w-6 h-6 text-purple-600" />;
      case 'time_freeze': return <Clock className="w-6 h-6 text-blue-700" />;
      case 'double_rewards': return <Star className="w-6 h-6 text-yellow-600" />;
      case 'infinite_energy': return <Battery className="w-6 h-6 text-green-600" />;
      default: return <Zap className="w-6 h-6 text-gray-400" />;
    }
  };

  const getSkillColor = (type: string) => {
    switch (type) {
      case 'coin_vacuum': return 'from-yellow-900/50 to-orange-900/50 border-yellow-500/50';
      case 'treasurer': return 'from-purple-900/50 to-indigo-900/50 border-purple-500/50';
      case 'xp_surge': return 'from-blue-900/50 to-cyan-900/50 border-blue-500/50';
      case 'luck_gem': return 'from-yellow-900/50 to-amber-900/50 border-yellow-500/50';
      case 'enchanter': return 'from-cyan-900/50 to-blue-900/50 border-cyan-500/50';
      case 'time_warp': return 'from-purple-900/50 to-violet-900/50 border-purple-500/50';
      case 'golden_touch': return 'from-yellow-900/50 to-orange-900/50 border-yellow-500/50';
      case 'knowledge_boost': return 'from-indigo-900/50 to-blue-900/50 border-indigo-500/50';
      case 'durability_master': return 'from-green-900/50 to-emerald-900/50 border-green-500/50';
      case 'relic_finder': return 'from-purple-900/50 to-pink-900/50 border-purple-500/50';
      case 'stat_amplifier': return 'from-red-900/50 to-orange-900/50 border-red-500/50';
      case 'question_master': return 'from-blue-900/50 to-indigo-900/50 border-blue-600/50';
      case 'gem_magnet': return 'from-cyan-900/50 to-teal-900/50 border-cyan-500/50';
      case 'streak_guardian': return 'from-orange-900/50 to-yellow-900/50 border-orange-500/50';
      case 'revival_blessing': return 'from-pink-900/50 to-purple-900/50 border-pink-500/50';
      case 'zone_skipper': return 'from-green-900/50 to-lime-900/50 border-green-600/50';
      case 'item_duplicator': return 'from-violet-900/50 to-purple-900/50 border-violet-500/50';
      case 'research_accelerator': return 'from-teal-900/50 to-cyan-900/50 border-teal-500/50';
      case 'garden_booster': return 'from-lime-900/50 to-green-900/50 border-lime-500/50';
      case 'market_refresh': return 'from-indigo-900/50 to-blue-900/50 border-indigo-600/50';
      // New skills
      case 'mega_multiplier': return 'from-red-900/50 to-orange-900/50 border-red-600/50';
      case 'instant_heal': return 'from-green-900/50 to-emerald-900/50 border-green-600/50';
      case 'perfect_accuracy': return 'from-blue-900/50 to-indigo-900/50 border-blue-700/50';
      case 'treasure_magnet': return 'from-yellow-900/50 to-gold-900/50 border-yellow-600/50';
      case 'skill_cooldown': return 'from-cyan-900/50 to-blue-900/50 border-cyan-600/50';
      case 'auto_upgrade': return 'from-orange-900/50 to-red-900/50 border-orange-700/50';
      case 'legendary_luck': return 'from-purple-900/50 to-pink-900/50 border-purple-700/50';
      case 'time_freeze': return 'from-blue-900/50 to-indigo-900/50 border-blue-800/50';
      case 'double_rewards': return 'from-yellow-900/50 to-orange-900/50 border-yellow-700/50';
      case 'infinite_energy': return 'from-green-900/50 to-teal-900/50 border-green-700/50';
      default: return 'from-gray-900/50 to-slate-900/50 border-gray-500/50';
    }
  };

  const skillDescriptions = {
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
    // New skills
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

  const isActiveSkillExpired = skills.activeMenuSkill && new Date() > new Date(skills.activeMenuSkill.expiresAt);
  const canRoll = coins >= 100 && (!skills.activeMenuSkill || isActiveSkillExpired);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <TypingInterface beautyMode={beautyMode}>
        <div className={`bg-gradient-to-br from-purple-900 to-indigo-900 p-4 sm:p-6 rounded-lg border border-purple-500/50 max-w-2xl w-full max-h-[80vh] overflow-y-auto ${beautyMode ? 'shadow-2xl border-2 border-purple-400/50' : ''}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              <div>
                <h2 className="text-white font-bold text-lg sm:text-xl">Menu Skills</h2>
                <p className="text-purple-300 text-sm">Roll for powerful temporary abilities</p>
              </div>
            </div>
            <EnhancedButton
              onClick={onClose}
              variant="secondary"
              size="sm"
              beautyMode={beautyMode}
              className="!p-2"
            >
              <X className="w-5 h-5" />
            </EnhancedButton>
          </div>

          {/* Current Active Skill */}
          {skills.activeMenuSkill && !isActiveSkillExpired && (
            <div className={`bg-gradient-to-r ${getSkillColor(skills.activeMenuSkill.type)} p-4 rounded-lg border mb-6 ${beautyMode ? 'shadow-xl' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                {getSkillIcon(skills.activeMenuSkill.type)}
                <div>
                  <h3 className="text-white font-bold text-lg">{skills.activeMenuSkill.name}</h3>
                  <p className="text-gray-300 text-sm">{skills.activeMenuSkill.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Active</span>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">
                    Expires: {new Date(skills.activeMenuSkill.expiresAt).toLocaleString()}
                  </p>
                  <p className="text-gray-300 text-xs">
                    {Math.max(0, Math.ceil((new Date(skills.activeMenuSkill.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))} hours left
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Roll Section */}
          <div className={`bg-black/30 p-4 rounded-lg border border-gray-600/50 mb-6 ${beautyMode ? 'shadow-lg' : ''}`}>
            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-3">Roll for New Skill</h3>
              <p className="text-gray-300 text-sm mb-4">
                Cost: 100 coins | Duration: Varies by skill
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Your coins: {coins}</span>
              </div>

              {isRolling ? (
                <div className="py-8">
                  <Dice6 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                  <p className="text-white font-semibold">Rolling for skill...</p>
                </div>
              ) : (
                <EnhancedButton
                  onClick={handleRoll}
                  disabled={!canRoll}
                  variant={canRoll ? 'primary' : 'secondary'}
                  size="lg"
                  beautyMode={beautyMode}
                >
                  {!canRoll && skills.activeMenuSkill && !isActiveSkillExpired
                    ? 'Skill Already Active'
                    : coins < 100
                    ? 'Not Enough Coins'
                    : 'Roll Skill (100 coins)'
                  }
                </EnhancedButton>
              )}
            </div>
          </div>

          {/* Available Skills Info */}
          <div className={`bg-black/30 p-4 rounded-lg ${beautyMode ? 'shadow-lg' : ''}`}>
            <h3 className="text-white font-bold text-lg mb-4">Available Skills (30 Total)</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(skillDescriptions).map(([type, description]) => (
                <div key={type} className="flex items-center gap-3">
                  {getSkillIcon(type)}
                  <div>
                    <h4 className="text-white font-semibold text-sm capitalize">
                      {type.replace('_', ' ')}
                    </h4>
                    <p className="text-gray-300 text-xs">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 text-center text-xs text-gray-400">
            <p>💡 Only one menu skill can be active at a time</p>
            <p>Each skill has different duration and effects</p>
            <p className="text-yellow-400 mt-1">✨ 10 new powerful skills added!</p>
          </div>
        </div>
      </TypingInterface>
    </div>
  );
};