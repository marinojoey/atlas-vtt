import type { SettingsService } from '../services/SettingsService';
import type { AtlasSettingSection } from './settingSections';
import { t } from '../i18n';

/** DM screen options. */
export function dmScreenSettingsSection(settings: SettingsService): AtlasSettingSection {
  return {
    heading: t('settings.dmScreen.heading'),
    rows: [{
      name: t('settings.dmScreen.minimizeStatblocks'),
      desc: t('settings.dmScreen.minimizeStatblocksDesc'),
      aliases: ['compact', 'statblock', 'dashboard'],
      render: setting => {
        setting.addToggle(toggle => toggle
          .setValue(settings.getSetting('minimizeStatblocks'))
          .onChange(enabled => settings.setSetting('minimizeStatblocks', enabled)));
      },
    }],
  };
}
