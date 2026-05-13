import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type RoomTheme = 0 | 1 | 2 | 3 | 4;
// 0 = Marble  1 = Honeycomb  2 = Magma  3 = Melon  4 = Diamond

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
  // 0 MARBLE
  {
    hiddenBotColor:   '#B0A898', hiddenRightColor: '#C8C0B0',
    revealedBorder:   'rgba(160,150,130,0.3)',
    shadowColor: '#00000060', shadowOpacity: 0.4, elevation: 4,
    gloss: 'rgba(255,255,255,0.32)',
    flagPoleColor: '#907860',
    exitColor: '#F2ECE0', exitAnim: 'stone-shatter',
  },
  // 1 HONEYCOMB
  {
    hiddenBotColor:   '#6A3200', hiddenRightColor: '#7A4200',
    revealedBorder:   'rgba(80,35,0,0.4)',
    shadowColor: '#AA440044', shadowOpacity: 0.55, elevation: 5,
    gloss: null,
    flagPoleColor: '#FFFFFF',
    exitColor: '#E08000', exitAnim: 'juicy-pop',
  },
  // 2 MAGMA
  {
    hiddenBotColor:   '#FF4500', hiddenRightColor: '#CC2000',
    revealedBorder:   'rgba(180,40,0,0.45)',
    shadowColor: '#FF440088', shadowOpacity: 0.9, elevation: 8,
    gloss: null,
    flagPoleColor: '#FF9900',
    exitColor: '#1E0C00', exitAnim: 'gem-burst',
  },
  // 3 MELON
  {
    hiddenBotColor:   '#7A6030', hiddenRightColor: '#8A7040',
    revealedBorder:   'rgba(110,85,40,0.3)',
    shadowColor: '#00000050', shadowOpacity: 0.3, elevation: 4,
    gloss: 'rgba(255,255,255,0.16)',
    flagPoleColor: '#604820',
    exitColor: '#D4BC8A', exitAnim: 'cheese-bite',
  },
  // 4 DIAMOND
  {
    hiddenBotColor:   '#5090C8', hiddenRightColor: '#70B0E0',
    revealedBorder:   'rgba(40,70,120,0.4)',
    shadowColor: '#40A0FF', shadowOpacity: 0.85, elevation: 7,
    gloss: null,
    flagPoleColor: '#FFFFFF',
    exitColor: '#AADEFF', exitAnim: 'gem-burst',
  },
];

// Grid background shown between tiles
export const THEME_GRID_BG = ['#D8D0C0', '#7A3800', '#FF3300', '#A08850', '#050E1A'];

// ── Marble vein data per variant ──────────────────────────────────────────
const MARBLE_VEINS = [
  [{ x: 0.28, a: 14, o: 0.45, w: 1 }, { x: 0.64, a: -9,  o: 0.30, w: 1   }],
  [{ x: 0.38, a: 22, o: 0.52, w: 1.5}, { x: 0.72, a:  5,  o: 0.24, w: 1   }],
  [{ x: 0.22, a:-17, o: 0.42, w: 1 }, { x: 0.52, a: 12,  o: 0.38, w: 1   }, { x: 0.80, a: -5, o: 0.20, w: 1 }],
  [{ x: 0.40, a:  9, o: 0.50, w: 1.5}, { x: 0.68, a:-20,  o: 0.36, w: 1   }],
];

const HC_GLOWS = [
  [{ r: 0, c: 2 }],
  [{ r: 2, c: 1 }],
  [{ r: 1, c: 3 }, { r: 3, c: 0 }],
  [{ r: 2, c: 2 }],
];

const MAGMA_CRACKS = [
  [{ x: 0.16, y: 0.18, a: 38,  l: 0.55, b: true  }, { x: 0.52, y: 0.08, a:-24, l: 0.40, b: false }, { x: 0.72, y: 0.48, a: 62, l: 0.28, b: false }],
  [{ x: 0.30, y: 0.06, a: 45,  l: 0.52, b: true  }, { x: 0.60, y: 0.38, a:-12, l: 0.44, b: false }],
  [{ x: 0.10, y: 0.30, a: 22,  l: 0.46, b: true  }, { x: 0.44, y: 0.08, a:-42, l: 0.38, b: false }, { x: 0.74, y: 0.04, a: 28, l: 0.36, b: false }],
  [{ x: 0.26, y: 0.14, a:-16,  l: 0.50, b: true  }, { x: 0.56, y: 0.42, a: 52, l: 0.34, b: false }],
];

const MELON_OFFSETS = [
  { h: [0, 1.2, -0.8, 1.5, -0.4, 0.9], v: [0, -1, 1.4, -0.6, 1.1, -0.3] },
  { h: [1, -0.5, 0.8, 1.6, -1.1, 0.3], v: [0.5, -1.2, 0.2, 1.8, -0.5, 1] },
  { h: [-0.8, 0.6, 1.2, -0.5, 1.4, 0], v: [-0.4, 1.1, 0, -1.3, 1.6, -0.2] },
  { h: [0.4, -1, 1, 0.2, -1.4, 0.8],  v: [1, 0.2, -0.8, 1.5, -0.3, 1.2] },
];

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

// ── Theme tile components ─────────────────────────────────────────────────

function MarbleTile({ size, variant, isRevealed }: { size: number; variant: number; isRevealed: boolean }) {
  const veins = MARBLE_VEINS[variant % 4];
  return (
    <>
      <LinearGradient
        colors={isRevealed ? ['#E4DDD0', '#D8D0BE'] : ['#FAFAF5', '#F0E8D6']}
        start={{ x: 0.15, y: 0.05 }} end={{ x: 0.85, y: 0.95 }}
        style={StyleSheet.absoluteFillObject}
      />
      {veins.map((v, i) => (
        <View key={i} style={{
          position: 'absolute',
          width: v.w, height: size * 2.4,
          backgroundColor: `rgba(150,135,110,${v.o})`,
          left: size * v.x, top: -(size * 0.7),
          transform: [{ rotate: `${v.a}deg` }],
        }} />
      ))}
    </>
  );
}

function HoneycombTile({ size, variant, isRevealed }: { size: number; variant: number; isRevealed: boolean }) {
  const COLS = 4;
  const CW   = size / (COLS + 0.3);
  const CH   = CW * 0.76;
  const ROWS = Math.ceil(size / CH) + 2;
  const glows = HC_GLOWS[variant % 4];
  const BR    = CW * 0.30;
  const cells: Array<{ x: number; y: number; glow: boolean }> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const x = c * CW + (r % 2 === 1 ? CW / 2 : 0) - CW * 0.15;
      const y = r * CH * 0.80 - CH * 0.5;
      if (x > size + CW) continue;
      cells.push({ x, y, glow: glows.some(g => g.r === r && g.c === c) });
    }
  }
  return (
    <>
      <LinearGradient
        colors={isRevealed ? ['#B86200', '#9A5000'] : ['#E88200', '#CA6600']}
        style={StyleSheet.absoluteFillObject}
      />
      {cells.map((cell, i) => (
        <View key={i} style={{
          position: 'absolute', left: cell.x, top: cell.y,
          width: CW - 1.5, height: CH - 1.5, borderRadius: BR,
          backgroundColor: cell.glow ? 'rgba(255,210,50,0.68)' : (isRevealed ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.07)'),
          borderWidth: 1, borderColor: 'rgba(70,28,0,0.60)',
        }}>
          {cell.glow && (
            <View style={{ position: 'absolute', top: '28%', left: '28%', width: '44%', height: '44%', backgroundColor: 'rgba(255,245,120,0.85)', borderRadius: 100 }} />
          )}
        </View>
      ))}
    </>
  );
}

function MagmaTile({ size, variant, isRevealed }: { size: number; variant: number; isRevealed: boolean }) {
  const cracks = isRevealed ? [] : MAGMA_CRACKS[variant % 4];
  return (
    <>
      <LinearGradient
        colors={isRevealed ? ['#120800', '#080300'] : ['#1E0C00', '#100600']}
        start={{ x: 0.3, y: 0.1 }} end={{ x: 0.7, y: 0.9 }}
        style={StyleSheet.absoluteFillObject}
      />
      {!isRevealed && (
        <View style={{ position: 'absolute', top: '8%', left: '8%', right: '8%', bottom: '8%', borderRadius: 3, backgroundColor: 'rgba(40,15,0,0.35)' }} />
      )}
      {cracks.map((c, i) => (
        <View key={i} style={{
          position: 'absolute', width: c.b ? 2 : 1.5, height: c.l * size,
          backgroundColor: c.b ? '#FF5200' : '#DD3000',
          left: c.x * size, top: c.y * size,
          transform: [{ rotate: `${c.a}deg` }],
          shadowColor: '#FF4000', shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.95, shadowRadius: c.b ? 4 : 2, elevation: 3,
        }} />
      ))}
    </>
  );
}

function MelonTile({ size, variant, isRevealed }: { size: number; variant: number; isRevealed: boolean }) {
  const off   = MELON_OFFSETS[variant % 4];
  const STEP  = size / 5.2;
  const COUNT = 7;
  return (
    <>
      <LinearGradient
        colors={isRevealed ? ['#C0A268', '#AC8E56'] : ['#D4BC8A', '#C2AA76']}
        start={{ x: 0.2, y: 0.1 }} end={{ x: 0.8, y: 0.9 }}
        style={StyleSheet.absoluteFillObject}
      />
      {!isRevealed && Array.from({ length: COUNT }, (_, i) => (
        <View key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, height: 1, top: i * STEP + (off.h[i] ?? 0), backgroundColor: 'rgba(100,65,20,0.22)' }} />
      ))}
      {!isRevealed && Array.from({ length: COUNT }, (_, i) => (
        <View key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, width: 1, left: i * STEP + (off.v[i] ?? 0), backgroundColor: 'rgba(100,65,20,0.18)' }} />
      ))}
    </>
  );
}

function DiamondTile({ size, variant, isRevealed }: { size: number; variant: number; isRevealed: boolean }) {
  const src = isRevealed ? DIAMOND_REVEALED : DIAMOND_HIDDEN[(variant ?? 0) % 6];
  return (
    <Image
      source={src}
      style={{ position: 'absolute', width: size, height: size }}
      resizeMode="stretch"
    />
  );
}

// ── Public component ──────────────────────────────────────────────────────

interface Props {
  theme:      RoomTheme;
  variant:    number;
  isRevealed: boolean;
  size:       number;
}

export function TileBackground({ theme, variant, isRevealed, size }: Props) {
  switch (theme) {
    case 0: return <MarbleTile    size={size} variant={variant} isRevealed={isRevealed} />;
    case 1: return <HoneycombTile size={size} variant={variant} isRevealed={isRevealed} />;
    case 2: return <MagmaTile     size={size} variant={variant} isRevealed={isRevealed} />;
    case 3: return <MelonTile     size={size} variant={variant} isRevealed={isRevealed} />;
    case 4: return <DiamondTile   size={size} variant={variant} isRevealed={isRevealed} />;
    default: return null;
  }
}
