import React from 'react';
import { Image } from 'react-native';

export type RoomTheme = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
// 0 = Honeycomb  1 = Magma  2 = Diamond  3 = Lillypad  4 = Honigmelone  5 = Mamor  6 = Stein  7 = Ziegelstein

// ── per-theme cell border / shadow config ──────────────────────────────────
export interface ThemeConfig {
  hiddenBotColor:   string;
  hiddenRightColor: string;
  revealedBorder:   string;
  shadowColor:      string;
  shadowOpacity:    number;
  elevation:        number;
  gloss:            string | null;
  flagPoleColor:    string;
  exitColor:        string;
  exitAnim: 'gem-burst' | 'cheese-bite' | 'fabric-fade' | 'stone-shatter' | 'juicy-pop';
}

export const THEME_CONFIG: ThemeConfig[] = [
  // 0 HONEYCOMB
  {
    hiddenBotColor:   '#4A2000', hiddenRightColor: '#5A2C00',
    revealedBorder:   'rgba(60,30,0,0.5)',
    shadowColor: '#C05000', shadowOpacity: 0.6, elevation: 5,
    gloss: null,
    flagPoleColor: '#FFFFFF',
    exitColor: '#E08000', exitAnim: 'juicy-pop',
  },
  // 1 MAGMA
  {
    hiddenBotColor:   '#2A1000', hiddenRightColor: '#3A1800',
    revealedBorder:   'rgba(200,60,0,0.5)',
    shadowColor: '#FF5500', shadowOpacity: 0.9, elevation: 8,
    gloss: null,
    flagPoleColor: '#FF9900',
    exitColor: '#FF6600', exitAnim: 'gem-burst',
  },
  // 2 DIAMOND
  {
    hiddenBotColor:   '#5090C8', hiddenRightColor: '#70B0E0',
    revealedBorder:   'rgba(40,70,120,0.4)',
    shadowColor: '#40A0FF', shadowOpacity: 0.85, elevation: 7,
    gloss: null,
    flagPoleColor: '#FFFFFF',
    exitColor: '#AADEFF', exitAnim: 'gem-burst',
  },
  // 3 LILLYPAD
  {
    hiddenBotColor:   '#1A3A28', hiddenRightColor: '#1E4430',
    revealedBorder:   'rgba(20,60,40,0.5)',
    shadowColor: '#204830', shadowOpacity: 0.65, elevation: 5,
    gloss: null,
    flagPoleColor: '#FFFFFF',
    exitColor: '#4A8060', exitAnim: 'fabric-fade',
  },
  // 4 HONIGMELONE
  {
    hiddenBotColor:   '#3A3000', hiddenRightColor: '#4A4010',
    revealedBorder:   'rgba(30,50,10,0.5)',
    shadowColor: '#806000', shadowOpacity: 0.55, elevation: 4,
    gloss: null,
    flagPoleColor: '#FFFFFF',
    exitColor: '#F0A040', exitAnim: 'cheese-bite',
  },
  // 5 MAMOR
  {
    hiddenBotColor:   '#888878', hiddenRightColor: '#A0A090',
    revealedBorder:   'rgba(40,40,60,0.4)',
    shadowColor: '#60604000', shadowOpacity: 0.3, elevation: 4,
    gloss: null,
    flagPoleColor: '#808070',
    exitColor: '#E8E0D0', exitAnim: 'stone-shatter',
  },
  // 6 STEIN
  {
    hiddenBotColor:   '#2A2A2A', hiddenRightColor: '#3A3A3A',
    revealedBorder:   'rgba(40,40,40,0.5)',
    shadowColor: '#303030', shadowOpacity: 0.5, elevation: 5,
    gloss: null,
    flagPoleColor: '#FFFFFF',
    exitColor: '#808080', exitAnim: 'stone-shatter',
  },
  // 7 ZIEGELSTEIN
  {
    hiddenBotColor:   '#5A2010', hiddenRightColor: '#6A2810',
    revealedBorder:   'rgba(80,30,10,0.5)',
    shadowColor: '#8B3A20', shadowOpacity: 0.6, elevation: 5,
    gloss: null,
    flagPoleColor: '#FFFFFF',
    exitColor: '#C06040', exitAnim: 'stone-shatter',
  },
];

// Grid background shown between tiles
export const THEME_GRID_BG = ['#1A0800', '#0A0000', '#050E1A', '#0A1E14', '#1A1400', '#1A1A28', '#1A1A1A', '#1A0A00'];

// Room background images (null = use default dark gradient)
export const THEME_BACKGROUND: (number | null)[] = [
  require('../../assets/honigwabe_design/Bienenwabe_hintergrund.png'),    // 0 Honeycomb
  require('../../assets/magma_design/Magma_hintergrund.png'),              // 1 Magma
  require('../../assets/diamant_design/Diamant_hintergrund.png'),          // 2 Diamond
  require('../../assets/lillypad_design/Lillypad_hintergrund.png'),        // 3 Lillypad
  require('../../assets/honigmelone_design/Honigmelone_hintergrund.png'),  // 4 Honigmelone
  require('../../assets/mamor_design/Mamor_hintergrund.png'),              // 5 Mamor
  require('../../assets/stein_design/Stein_hintergrund.png'),              // 6 Stein
  require('../../assets/ziegelstein_design/Ziegelstein_hintergrund.png'),  // 7 Ziegelstein
];

// ── Honeycomb tile assets ──────────────────────────────────────────────────
const HONEYCOMB_HIDDEN = [
  require('../../assets/honigwabe_design/Bienenwabe1_unaufgedeckt.png'),
  require('../../assets/honigwabe_design/Bienenwabe2_unaufgedeckt.png'),
  require('../../assets/honigwabe_design/Bienenwabe3_unaufgedeckt.png'),
];
const HONEYCOMB_REVEALED = require('../../assets/honigwabe_design/Bienenwabe_aufgedeckt.png');

// ── Magma tile assets ─────────────────────────────────────────────────────
const MAGMA_HIDDEN = [
  require('../../assets/magma_design/Magma1_unaufgedeckt.png'),
  require('../../assets/magma_design/Magma2_unaufgedeck.png'),
  require('../../assets/magma_design/Magma3_unaufgedeck.png'),
];
const MAGMA_REVEALED = require('../../assets/magma_design/Magma_aufgedeckt.png');

// ── Diamond tile assets ────────────────────────────────────────────────────
const DIAMOND_HIDDEN = [
  require('../../assets/diamant_design/Diamant1_unaufgedeckt.png'),
  require('../../assets/diamant_design/Diamant2_unaufgedeckt.png'),
  require('../../assets/diamant_design/Diamant3_unaufgedeckt.png'),
  require('../../assets/diamant_design/Diamant4_unaufgedeckt.png'),
  require('../../assets/diamant_design/Diamant5_unaufgedeckt.png'),
  require('../../assets/diamant_design/Diamant6_unaufgedeckt.png'),
];
const DIAMOND_REVEALED = require('../../assets/diamant_design/Diamant_aufgedeckt.png');

// ── Lillypad tile assets ───────────────────────────────────────────────────
const LILLYPAD_HIDDEN = [
  require('../../assets/lillypad_design/Lillypad1_unaufgedeckt.png'),
  require('../../assets/lillypad_design/Lillypad2_unaufgedeckt.png'),
  require('../../assets/lillypad_design/Lillypad3_unaufgedeckt.png'),
];
const LILLYPAD_REVEALED = require('../../assets/lillypad_design/Lillypad_aufgedeckt.png');

// ── Honigmelone tile assets ────────────────────────────────────────────────
const HONIGMELONE_HIDDEN = [
  require('../../assets/honigmelone_design/Honigmelone1_unaufgedeckt.png'),
];
const HONIGMELONE_REVEALED = require('../../assets/honigmelone_design/Honigmelone_aufgedeckt.png');

// ── Stein tile assets ─────────────────────────────────────────────────────
const STEIN_HIDDEN = [
  require('../../assets/stein_design/Stein1_unaufgedeckt.png'),
  require('../../assets/stein_design/Stein2_unaufgedeckt.png'),
  require('../../assets/stein_design/Stein3_unaufgedeckt.png'),
];
const STEIN_REVEALED = require('../../assets/stein_design/Stein_aufgedeckt.png');

// ── Ziegelstein tile assets ────────────────────────────────────────────────
const ZIEGELSTEIN_HIDDEN = [
  require('../../assets/ziegelstein_design/Ziegelstein1_unaufgedeckt.png'),
  require('../../assets/ziegelstein_design/Ziegelstein2_unaufgedeckt.png'),
];
const ZIEGELSTEIN_REVEALED = require('../../assets/ziegelstein_design/Ziegelstein_aufgedeckt.png');

// ── Mamor tile assets ──────────────────────────────────────────────────────
const MAMOR_HIDDEN = [
  require('../../assets/mamor_design/Mamor2_unaufgedeckt.png'),
  require('../../assets/mamor_design/Mamor3_unaufgedecktpng.png'),
];
const MAMOR_REVEALED = require('../../assets/mamor_design/Mamor_aufgedeckt.png');

// ── Public component ──────────────────────────────────────────────────────

interface Props {
  theme:      RoomTheme;
  variant:    number;
  isRevealed: boolean;
}

const HIDDEN_TILES = [HONEYCOMB_HIDDEN, MAGMA_HIDDEN, DIAMOND_HIDDEN, LILLYPAD_HIDDEN, HONIGMELONE_HIDDEN, MAMOR_HIDDEN, STEIN_HIDDEN, ZIEGELSTEIN_HIDDEN];
const HIDDEN_COUNTS = [3, 3, 6, 3, 1, 2, 3, 2];
const REVEALED_TILES = [HONEYCOMB_REVEALED, MAGMA_REVEALED, DIAMOND_REVEALED, LILLYPAD_REVEALED, HONIGMELONE_REVEALED, MAMOR_REVEALED, STEIN_REVEALED, ZIEGELSTEIN_REVEALED];

// All tile + background assets collected in one flat array for Asset.loadAsync
export const ALL_TILE_ASSETS: number[] = [
  ...HONEYCOMB_HIDDEN, HONEYCOMB_REVEALED,
  ...MAGMA_HIDDEN,     MAGMA_REVEALED,
  ...DIAMOND_HIDDEN,   DIAMOND_REVEALED,
  ...LILLYPAD_HIDDEN,  LILLYPAD_REVEALED,
  ...HONIGMELONE_HIDDEN, HONIGMELONE_REVEALED,
  ...MAMOR_HIDDEN,     MAMOR_REVEALED,
  ...STEIN_HIDDEN,     STEIN_REVEALED,
  ...ZIEGELSTEIN_HIDDEN, ZIEGELSTEIN_REVEALED,
  // Background images (null entries filtered out below)
  ...( THEME_BACKGROUND.filter((x): x is number => x !== null) ),
];

export function TileBackground({ theme, variant, isRevealed }: Props) {
  const src = isRevealed
    ? REVEALED_TILES[theme]
    : HIDDEN_TILES[theme][(variant ?? 0) % HIDDEN_COUNTS[theme]];
  return (
    <Image
      source={src}
      style={{ width: '100%', height: '100%' }}
      resizeMode="contain"
    />
  );
}
