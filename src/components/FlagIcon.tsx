import React from 'react';
import { View } from 'react-native';

interface Props {
  size: number;
  poleColor?: string;
  flagColor?: string;
}

export function FlagIcon({ size, poleColor = '#FFFFFF', flagColor = '#FF3B30' }: Props) {
  const poleW  = Math.max(1.5, Math.round(size * 0.10));
  const poleH  = Math.round(size * 0.85);
  const panelW = Math.round(size * 0.56);
  const panelH = Math.round(size * 0.42);
  const baseW  = Math.round(size * 0.65);
  const baseH  = Math.max(2, Math.round(size * 0.10));
  const poleX  = Math.round(size * 0.18);

  return (
    <View style={{ width: size, height: size }}>
      {/* Flag panel — top-right of pole */}
      <View style={{
        position: 'absolute',
        left: poleX + poleW,
        top: 0,
        width: panelW,
        height: panelH,
        backgroundColor: flagColor,
        borderRadius: 1,
      }} />
      {/* Pole */}
      <View style={{
        position: 'absolute',
        left: poleX,
        top: 0,
        width: poleW,
        height: poleH,
        backgroundColor: poleColor,
        borderRadius: 1,
      }} />
      {/* Stand / base */}
      <View style={{
        position: 'absolute',
        left: poleX - Math.round((baseW - poleW) / 2),
        bottom: 0,
        width: baseW,
        height: baseH,
        backgroundColor: poleColor,
        borderRadius: 1,
      }} />
    </View>
  );
}
