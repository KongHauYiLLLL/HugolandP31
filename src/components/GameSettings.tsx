import React from 'react';
import { Settings, X, Eye, Moon, Sun, Globe, Bell, BellOff, Grid3X3, Sparkles } from 'lucide-react';
import { GameSettings as SettingsType } from '../types/game';
import { getTranslation, t } from '../utils/translations';
import { EnhancedButton } from './EnhancedButton';
import { TypingInterface } from './TypingInterface';

interface GameSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onClose: () => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const translation = getTranslation(settings.language);
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const toggleSetting = (key: keyof SettingsType) => {
    onUpdateSettings({ [key]: !settings[key] });
  };

  const updateLanguage = (language: SettingsType['language']) => {
    onUpdateSettings({ language });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <TypingInterface beautyMode={settings.beautyMode}>
        <div className={`bg-gradient-to-br ${settings.darkMode ? 'from-gray-900 to-slate-900' : 'from-gray-100 to-white'} p-4 sm:p-6 rounded-lg border ${settings.darkMode ? 'border-gray-500/50' : 'border-gray-300'} max-w-2xl w-full max-h-[80vh] overflow-y-auto ${settings.beautyMode ? 'shadow-2xl border-2 border-purple-500/30' : ''}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Settings className={`w-6 h-6 sm:w-8 sm:h-8 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <h2 className={`${settings.darkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg sm:text-xl`}>
                  {translation.settings.title}
                </h2>
                <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  {translation.settings.subtitle}
                </p>
              </div>
            </div>
            <EnhancedButton
              onClick={onClose}
              variant="secondary"
              size="sm"
              beautyMode={settings.beautyMode}
              className="!p-2"
            >
              <X className="w-5 h-5" />
            </EnhancedButton>
          </div>

          <div className="space-y-6">
            {/* Visual Settings */}
            <div className={`${settings.darkMode ? 'bg-black/30' : 'bg-gray-50'} p-4 rounded-lg border ${settings.darkMode ? 'border-gray-600/50' : 'border-gray-200'} ${settings.beautyMode ? 'shadow-lg border-purple-300/30' : ''}`}>
              <h3 className={`${settings.darkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg mb-4`}>
                {translation.settings.visual}
              </h3>
              
              <div className="space-y-4">
                {/* Beauty Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className={`w-5 h-5 ${settings.beautyMode ? 'text-pink-400' : settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div>
                      <p className={`${settings.darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                        Beauty Mode
                      </p>
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        Enhanced visual effects and animations
                      </p>
                    </div>
                  </div>
                  <EnhancedButton
                    onClick={() => toggleSetting('beautyMode')}
                    variant={settings.beautyMode ? 'primary' : 'secondary'}
                    size="sm"
                    beautyMode={settings.beautyMode}
                  >
                    {settings.beautyMode ? 'ON' : 'OFF'}
                  </EnhancedButton>
                </div>

                {/* Snap to Grid */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Grid3X3 className={`w-5 h-5 ${settings.snapToGrid ? 'text-blue-400' : settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div>
                      <p className={`${settings.darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                        Snap to Grid
                      </p>
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        Show alignment grid overlay
                      </p>
                    </div>
                  </div>
                  <EnhancedButton
                    onClick={() => toggleSetting('snapToGrid')}
                    variant={settings.snapToGrid ? 'primary' : 'secondary'}
                    size="sm"
                    beautyMode={settings.beautyMode}
                  >
                    {settings.snapToGrid ? 'ON' : 'OFF'}
                  </EnhancedButton>
                </div>

                {/* Colorblind Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className={`w-5 h-5 ${settings.colorblindMode ? 'text-blue-400' : settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div>
                      <p className={`${settings.darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                        {translation.settings.colorblind}
                      </p>
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        {translation.settings.colorblindDesc}
                      </p>
                      {settings.colorblindMode && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="text-gray-300 font-normal">Common ●</span>
                          <span className="text-cyan-300 font-medium">Rare ◆</span>
                          <span className="text-indigo-300 font-semibold">Epic ▲</span>
                          <span className="text-amber-300 font-bold">Legendary ★</span>
                          <span className="text-pink-300 font-black">Mythical ♦</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <EnhancedButton
                    onClick={() => toggleSetting('colorblindMode')}
                    variant={settings.colorblindMode ? 'primary' : 'secondary'}
                    size="sm"
                    beautyMode={settings.beautyMode}
                  >
                    {settings.colorblindMode ? 'ON' : 'OFF'}
                  </EnhancedButton>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.darkMode ? (
                      <Moon className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className={`${settings.darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                        {translation.settings.darkMode}
                      </p>
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        {translation.settings.darkModeDesc}
                      </p>
                    </div>
                  </div>
                  <EnhancedButton
                    onClick={() => toggleSetting('darkMode')}
                    variant={settings.darkMode ? 'primary' : 'warning'}
                    size="sm"
                    beautyMode={settings.beautyMode}
                  >
                    {settings.darkMode ? 'DARK' : 'LIGHT'}
                  </EnhancedButton>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.notifications ? (
                      <Bell className="w-5 h-5 text-blue-400" />
                    ) : (
                      <BellOff className={`w-5 h-5 ${settings.darkMode ? 'text-red-400' : 'text-red-500'}`} />
                    )}
                    <div>
                      <p className={`${settings.darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                        {translation.settings.notifications}
                      </p>
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        {translation.settings.notificationsDesc}
                      </p>
                    </div>
                  </div>
                  <EnhancedButton
                    onClick={() => toggleSetting('notifications')}
                    variant={settings.notifications ? 'success' : 'danger'}
                    size="sm"
                    beautyMode={settings.beautyMode}
                  >
                    {settings.notifications ? 'ON' : 'OFF'}
                  </EnhancedButton>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className={`${settings.darkMode ? 'bg-black/30' : 'bg-gray-50'} p-4 rounded-lg border ${settings.darkMode ? 'border-gray-600/50' : 'border-gray-200'} ${settings.beautyMode ? 'shadow-lg border-green-300/30' : ''}`}>
              <h3 className={`${settings.darkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg mb-4 flex items-center gap-2`}>
                <Globe className="w-5 h-5 text-green-400" />
                {translation.settings.language}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <EnhancedButton
                    key={lang.code}
                    onClick={() => updateLanguage(lang.code as SettingsType['language'])}
                    variant={settings.language === lang.code ? 'success' : 'secondary'}
                    size="sm"
                    beautyMode={settings.beautyMode}
                    className="!justify-start !text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <div>
                        <p className="font-semibold text-sm">
                          {lang.name}
                        </p>
                      </div>
                    </div>
                  </EnhancedButton>
                ))}
              </div>
              
              <div className={`mt-3 p-3 ${settings.darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} rounded-lg border ${settings.darkMode ? 'border-yellow-500/30' : 'border-yellow-200'}`}>
                <p className={`${settings.darkMode ? 'text-yellow-300' : 'text-yellow-700'} text-sm`}>
                  {translation.settings.languageNote}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>{translation.settings.autoSaved}</p>
          </div>
        </div>
      </TypingInterface>
    </div>
  );
};