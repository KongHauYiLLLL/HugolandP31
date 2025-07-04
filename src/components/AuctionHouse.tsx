import React, { useState, useEffect } from 'react';
import { AuctionHouse as AuctionHouseType, AuctionListing, Weapon, Armor } from '../types/game';
import { Gavel, Clock, Coins, X, TrendingUp, TrendingDown, Package, Sword, Shield, Timer, Users, Crown } from 'lucide-react';
import { getRarityColor, getRarityBorder } from '../utils/gameUtils';
import { EnhancedButton } from './EnhancedButton';
import { TypingInterface } from './TypingInterface';

interface AuctionHouseProps {
  auctionHouse: AuctionHouseType;
  coins: number;
  playerWeapons: Weapon[];
  playerArmor: Armor[];
  onListItem: (itemId: string, itemType: 'weapon' | 'armor', startingBid: number, duration: number) => boolean;
  onPlaceBid: (listingId: string, bidAmount: number) => boolean;
  onClaimWonItem: (listingId: string) => boolean;
  onClose: () => void;
  beautyMode?: boolean;
}

export const AuctionHouse: React.FC<AuctionHouseProps> = ({
  auctionHouse,
  coins,
  playerWeapons,
  playerArmor,
  onListItem,
  onPlaceBid,
  onClaimWonItem,
  onClose,
  beautyMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'myListings'>('browse');
  const [selectedItem, setSelectedItem] = useState<Weapon | Armor | null>(null);
  const [startingBid, setStartingBid] = useState<number>(100);
  const [duration, setDuration] = useState<number>(60); // minutes
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [selectedListing, setSelectedListing] = useState<AuctionListing | null>(null);

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.floor(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const getAIInterestColor = (interest: string) => {
    switch (interest) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getAIInterestText = (interest: string) => {
    switch (interest) {
      case 'high': return 'High Interest';
      case 'medium': return 'Medium Interest';
      case 'low': return 'Low Interest';
      default: return 'No Interest';
    }
  };

  const calculateSuggestedBid = (item: Weapon | Armor): number => {
    const baseValue = 'baseAtk' in item ? item.baseAtk : item.baseDef;
    const rarityMultiplier = {
      common: 1,
      rare: 2,
      epic: 4,
      legendary: 8,
      mythical: 16
    };
    
    let value = baseValue * rarityMultiplier[item.rarity] * item.level;
    
    if (item.isEnchanted) {
      value *= 3;
    }
    
    // Durability factor
    const durabilityPercent = item.durability / item.maxDurability;
    value *= Math.max(0.1, durabilityPercent);
    
    return Math.max(50, Math.floor(value));
  };

  const handleListItem = () => {
    if (!selectedItem) return;
    
    const itemType = 'baseAtk' in selectedItem ? 'weapon' : 'armor';
    const success = onListItem(selectedItem.id, itemType, startingBid, duration);
    
    if (success) {
      setSelectedItem(null);
      setStartingBid(100);
      setDuration(60);
    }
  };

  const handlePlaceBid = () => {
    if (!selectedListing || bidAmount <= selectedListing.currentBid) return;
    
    const success = onPlaceBid(selectedListing.id, bidAmount);
    
    if (success) {
      setSelectedListing(null);
      setBidAmount(0);
    }
  };

  const availableItems = [...playerWeapons, ...playerArmor].filter(item => 
    !auctionHouse.playerListings.some(listing => listing.item.id === item.id)
  );

  const wonListings = auctionHouse.aiListings.filter(listing => 
    listing.timeRemaining <= 0 && listing.highestBidder === 'player'
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <TypingInterface beautyMode={beautyMode}>
        <div className={`bg-gradient-to-br from-amber-900 to-orange-900 p-4 sm:p-6 rounded-lg border border-amber-500/50 max-w-6xl w-full max-h-[90vh] overflow-y-auto ${beautyMode ? 'shadow-2xl border-2 border-amber-400/50 shadow-amber-500/30' : ''}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Gavel className={`w-6 h-6 sm:w-8 sm:h-8 text-amber-400 ${beautyMode ? 'animate-pulse' : ''}`} />
              <div>
                <h2 className="text-white font-bold text-lg sm:text-xl">🏛️ Auction House</h2>
                <p className="text-amber-300 text-sm">Buy and sell items with other adventurers</p>
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

          {/* Current Coins */}
          <div className={`bg-black/30 p-3 rounded-lg mb-6 text-center ${beautyMode ? 'shadow-lg border border-yellow-500/30' : ''}`}>
            <div className="flex items-center justify-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Your Coins: {coins.toLocaleString()}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'browse', label: 'Browse Auctions', icon: Package },
              { key: 'sell', label: 'Sell Items', icon: TrendingUp },
              { key: 'myListings', label: 'My Listings', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <EnhancedButton
                key={key}
                onClick={() => setActiveTab(key as any)}
                variant={activeTab === key ? 'primary' : 'secondary'}
                size="sm"
                beautyMode={beautyMode}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </EnhancedButton>
            ))}
          </div>

          {/* Won Items Banner */}
          {wonListings.length > 0 && (
            <div className={`bg-green-900/50 border border-green-500/50 p-4 rounded-lg mb-6 ${beautyMode ? 'shadow-xl' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-green-400 font-bold">🎉 Congratulations! You won {wonListings.length} auction(s)!</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {wonListings.map(listing => (
                  <EnhancedButton
                    key={listing.id}
                    onClick={() => onClaimWonItem(listing.id)}
                    variant="success"
                    size="sm"
                    beautyMode={beautyMode}
                  >
                    Claim {listing.item.name}
                  </EnhancedButton>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'browse' && (
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Available Auctions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {auctionHouse.aiListings.filter(listing => listing.timeRemaining > 0).map(listing => (
                  <div
                    key={listing.id}
                    className={`p-4 rounded-lg border-2 ${getRarityBorder(listing.item.rarity)} bg-black/40 ${beautyMode ? 'shadow-lg hover:shadow-xl transition-shadow' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {'baseAtk' in listing.item ? (
                        <Sword className="w-4 h-4 text-orange-400" />
                      ) : (
                        <Shield className="w-4 h-4 text-blue-400" />
                      )}
                      <h4 className={`font-bold text-sm ${getRarityColor(listing.item.rarity)}`}>
                        {listing.item.name}
                      </h4>
                    </div>

                    <div className="text-xs text-gray-300 space-y-1 mb-3">
                      <p>Level {listing.item.level}</p>
                      <p>
                        {'baseAtk' in listing.item 
                          ? `ATK: ${listing.item.baseAtk + (listing.item.level - 1) * 10}` 
                          : `DEF: ${listing.item.baseDef + (listing.item.level - 1) * 5}`
                        }
                      </p>
                      <p>Durability: {listing.item.durability}/{listing.item.maxDurability}</p>
                      {listing.item.isEnchanted && (
                        <p className="text-cyan-400 font-semibold">✨ Enchanted</p>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Bid:</span>
                        <span className="text-yellow-400 font-bold">{listing.currentBid} coins</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Time Left:</span>
                        <span className="text-white">{formatTimeRemaining(listing.timeRemaining)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">AI Interest:</span>
                        <span className={getAIInterestColor(listing.aiInterest)}>
                          {getAIInterestText(listing.aiInterest)}
                        </span>
                      </div>
                    </div>

                    <EnhancedButton
                      onClick={() => {
                        setSelectedListing(listing);
                        setBidAmount(listing.currentBid + 10);
                      }}
                      variant="primary"
                      size="sm"
                      beautyMode={beautyMode}
                      className="w-full"
                      disabled={listing.highestBidder === 'player'}
                    >
                      {listing.highestBidder === 'player' ? 'You\'re Winning!' : 'Place Bid'}
                    </EnhancedButton>
                  </div>
                ))}
              </div>

              {auctionHouse.aiListings.filter(listing => listing.timeRemaining > 0).length === 0 && (
                <div className="text-center py-8">
                  <Gavel className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No active auctions</p>
                  <p className="text-gray-500 text-sm">Check back later for new items!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sell' && (
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Sell Your Items</h3>
              
              {selectedItem ? (
                <div className={`bg-black/30 p-4 rounded-lg mb-4 ${beautyMode ? 'shadow-lg border border-purple-500/30' : ''}`}>
                  <h4 className="text-white font-bold mb-3">List Item for Auction</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className={`p-3 rounded-lg border-2 ${getRarityBorder(selectedItem.rarity)} bg-black/20`}>
                        <div className="flex items-center gap-2 mb-2">
                          {'baseAtk' in selectedItem ? (
                            <Sword className="w-4 h-4 text-orange-400" />
                          ) : (
                            <Shield className="w-4 h-4 text-blue-400" />
                          )}
                          <h5 className={`font-bold ${getRarityColor(selectedItem.rarity)}`}>
                            {selectedItem.name}
                          </h5>
                        </div>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Level {selectedItem.level}</p>
                          <p>
                            {'baseAtk' in selectedItem 
                              ? `ATK: ${selectedItem.baseAtk + (selectedItem.level - 1) * 10}` 
                              : `DEF: ${selectedItem.baseDef + (selectedItem.level - 1) * 5}`
                            }
                          </p>
                          <p>Durability: {selectedItem.durability}/{selectedItem.maxDurability}</p>
                          {selectedItem.isEnchanted && (
                            <p className="text-cyan-400 font-semibold">✨ Enchanted</p>
                          )}
                        </div>
                      </div>
                      <p className="text-yellow-400 text-sm mt-2">
                        Suggested starting bid: {calculateSuggestedBid(selectedItem)} coins
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-white font-semibold mb-2">Starting Bid (coins)</label>
                        <input
                          type="number"
                          value={startingBid}
                          onChange={(e) => setStartingBid(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2">Duration</label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
                        >
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={240}>4 hours</option>
                          <option value={480}>8 hours</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <EnhancedButton
                          onClick={handleListItem}
                          variant="success"
                          beautyMode={beautyMode}
                          className="flex-1"
                        >
                          List Item
                        </EnhancedButton>
                        <EnhancedButton
                          onClick={() => setSelectedItem(null)}
                          variant="secondary"
                          beautyMode={beautyMode}
                        >
                          Cancel
                        </EnhancedButton>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 rounded-lg border-2 ${getRarityBorder(item.rarity)} bg-black/40 cursor-pointer hover:bg-black/60 transition-colors ${beautyMode ? 'hover:shadow-lg' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {'baseAtk' in item ? (
                          <Sword className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-blue-400" />
                        )}
                        <h4 className={`font-bold text-sm ${getRarityColor(item.rarity)}`}>
                          {item.name}
                        </h4>
                      </div>
                      <div className="text-xs text-gray-300 space-y-1">
                        <p>Level {item.level}</p>
                        <p>
                          {'baseAtk' in item 
                            ? `ATK: ${item.baseAtk + (item.level - 1) * 10}` 
                            : `DEF: ${item.baseDef + (item.level - 1) * 5}`
                          }
                        </p>
                        <p>Durability: {item.durability}/{item.maxDurability}</p>
                        {item.isEnchanted && (
                          <p className="text-cyan-400 font-semibold">✨ Enchanted</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {availableItems.length === 0 && !selectedItem && (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No items available to sell</p>
                  <p className="text-gray-500 text-sm">All your items are either equipped or already listed!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'myListings' && (
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Your Active Listings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {auctionHouse.playerListings.map(listing => (
                  <div
                    key={listing.id}
                    className={`p-4 rounded-lg border-2 ${getRarityBorder(listing.item.rarity)} bg-black/40 ${beautyMode ? 'shadow-lg' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {'baseAtk' in listing.item ? (
                        <Sword className="w-4 h-4 text-orange-400" />
                      ) : (
                        <Shield className="w-4 h-4 text-blue-400" />
                      )}
                      <h4 className={`font-bold text-sm ${getRarityColor(listing.item.rarity)}`}>
                        {listing.item.name}
                      </h4>
                    </div>

                    <div className="text-xs text-gray-300 space-y-1 mb-3">
                      <p>Starting Bid: {listing.startingBid} coins</p>
                      <p>Current Bid: {listing.currentBid} coins</p>
                      <p>Time Left: {formatTimeRemaining(listing.timeRemaining)}</p>
                      <p>Bids: {listing.bids.length}</p>
                      {listing.highestBidder && (
                        <p className="text-green-400">
                          Highest Bidder: {listing.highestBidder === 'player' ? 'You' : 'AI Bidder'}
                        </p>
                      )}
                    </div>

                    {listing.timeRemaining <= 0 && (
                      <div className="text-center">
                        {listing.highestBidder ? (
                          <p className="text-green-400 font-semibold">
                            Sold for {listing.currentBid} coins!
                          </p>
                        ) : (
                          <p className="text-red-400 font-semibold">
                            No bids received
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {auctionHouse.playerListings.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No active listings</p>
                  <p className="text-gray-500 text-sm">Go to the Sell tab to list your items!</p>
                </div>
              )}
            </div>
          )}

          {/* Bid Modal */}
          {selectedListing && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className={`bg-gradient-to-br from-gray-900 to-slate-900 p-6 rounded-lg border border-gray-500/50 max-w-md w-full ${beautyMode ? 'shadow-2xl border-2 border-blue-400/50' : ''}`}>
                <h3 className="text-white font-bold text-lg mb-4">Place Bid</h3>
                
                <div className={`p-3 rounded-lg border-2 ${getRarityBorder(selectedListing.item.rarity)} bg-black/20 mb-4`}>
                  <h4 className={`font-bold ${getRarityColor(selectedListing.item.rarity)}`}>
                    {selectedListing.item.name}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Current bid: {selectedListing.currentBid} coins
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-white font-semibold mb-2">Your Bid (coins)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    min={selectedListing.currentBid + 1}
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Minimum bid: {selectedListing.currentBid + 1} coins
                  </p>
                </div>

                <div className="flex gap-2">
                  <EnhancedButton
                    onClick={handlePlaceBid}
                    variant="primary"
                    beautyMode={beautyMode}
                    className="flex-1"
                    disabled={bidAmount <= selectedListing.currentBid || bidAmount > coins}
                  >
                    Place Bid
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={() => setSelectedListing(null)}
                    variant="secondary"
                    beautyMode={beautyMode}
                  >
                    Cancel
                  </EnhancedButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </TypingInterface>
    </div>
  );
};