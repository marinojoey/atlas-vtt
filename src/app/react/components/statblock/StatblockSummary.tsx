import React from 'react';
import type { StatblockItem, StatblockMonster } from './statblockTypes';
import { abilityModifier, stringify } from './statblockUtils';
import { t } from '../../../i18n';

/** Layout sections a minimized statblock keeps: what a creature can do on its turn. */
const ACTION_PROPERTIES = new Set(['actions', 'bonus_actions', 'reactions', 'legendary_actions', 'mythic_actions', 'lair_actions']);

type Entry = [label: string, value: string];

export interface MinimizedStatblock {
  heading: StatblockItem | undefined;
  /** AC, maximum hit points and speed. */
  vitals: Entry[];
  modifiers: Entry[];
  actions: StatblockItem[];
}

/** A value without its parenthetical: `16 (chain shirt)` → `16`. */
function bare(value: unknown): string {
  return stringify(value).replace(/\s*\(.*\)$/, '');
}

function headingIn(items: readonly StatblockItem[]): StatblockItem | undefined {
  return items.find((item) => item.type === 'heading') ?? items.map((item) => headingIn(item.nested ?? [])).find(Boolean);
}

/** What a minimized statblock shows, or `null` for a creature without an armor class. */
export function minimizeStatblock(blocks: readonly StatblockItem[], monster: StatblockMonster): MinimizedStatblock | null {
  if (monster.ac == null) return null;
  const table = blocks.find((item) => item.type === 'table' && item.properties?.[0] === 'stats');
  const modifiers = table && Array.isArray(monster.stats)
    ? monster.stats.map((stat: unknown, index: number): Entry => [table.headers?.[index] ?? '', abilityModifier(stat as number, table, monster)])
    : [];
  const filled = (entries: Entry[]): Entry[] => entries.filter(([, value]) => value);
  return {
    heading: headingIn(blocks),
    vitals: filled([
      [t('statblock.armorClassShort'), bare(monster.ac)],
      [t('statblock.maxHitPoints'), bare(monster.hp)],
      [t('statblock.speedShort'), stringify(monster.speed)],
    ]),
    modifiers: filled(modifiers),
    // Actions follow the summary untitled; the other sections keep their titles.
    actions: blocks
      .filter((item) => item.properties?.some((key) => ACTION_PROPERTIES.has(key)))
      .map((item) => (item.properties?.[0] === 'actions' ? { ...item, heading: '' } : item)),
  };
}

function SummaryLine({ entries, className }: { entries: Entry[]; className: string }): React.JSX.Element | null {
  if (!entries.length) return null;
  return (
    <div className={className}>
      {entries.map(([label, value]) => (
        <span key={label}><span className="atlas-sb-property-name">{label}:</span>{value}</span>
      ))}
    </div>
  );
}

/** A minimized statblock's two lines: AC, maximum hit points and speed, then ability modifiers. */
export function StatblockSummary({ vitals, modifiers }: Pick<MinimizedStatblock, 'vitals' | 'modifiers'>): React.JSX.Element {
  return (
    <div className="atlas-sb-item" data-type="summary">
      <SummaryLine entries={vitals} className="atlas-sb-summary-vitals" />
      <SummaryLine entries={modifiers} className="atlas-sb-summary-modifiers" />
    </div>
  );
}
