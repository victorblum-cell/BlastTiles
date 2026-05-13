import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system'; // best-effort; may be absent in Expo Go

const SR = 22050;

// ---------- WAV synthesis primitives ----------

function tone(freq: number, ms: number, vol = 0.6, decay = 4): number[] {
  const n = Math.floor(SR * ms / 1000);
  const out = new Array<number>(n);
  const atk = Math.max(1, Math.floor(n * 0.04));
  for (let i = 0; i < n; i++) {
    const env = (i < atk ? i / atk : 1.0) * Math.exp(-decay * i / n);
    out[i] = Math.round(Math.sin(2 * Math.PI * freq * i / SR) * env * vol * 32767);
  }
  return out;
}

function chirp(f0: number, f1: number, ms: number, vol = 0.55): number[] {
  const n = Math.floor(SR * ms / 1000);
  const T = ms / 1000;
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = i / n;
    const phase = 2 * Math.PI * (f0 * t + (f1 - f0) * t * t / (2 * T));
    const env = (p < 0.05 ? p / 0.05 : 1.0) * Math.exp(-4 * p);
    out[i] = Math.round(Math.sin(phase) * env * vol * 32767);
  }
  return out;
}

function noise(ms: number, vol = 0.7, decay = 7, smooth = 0.22): number[] {
  const n = Math.floor(SR * ms / 1000);
  const out = new Array<number>(n);
  let seed = 0xdeadbeef >>> 0;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    seed ^= seed << 13;  seed = seed >>> 0;
    seed ^= seed >>> 17; seed = seed >>> 0;
    seed ^= seed << 5;   seed = seed >>> 0;
    const r = (seed / 0x100000000) * 2 - 1;
    prev = smooth * r + (1 - smooth) * prev;
    out[i] = Math.round(prev * Math.exp(-decay * i / n) * vol * 32767);
  }
  return out;
}

function gap(ms: number): number[] {
  return new Array<number>(Math.max(1, Math.floor(SR * ms / 1000))).fill(0);
}

function join(...parts: number[][]): number[] {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Array<number>(total);
  let pos = 0;
  for (const p of parts) { for (let i = 0; i < p.length; i++) out[pos++] = p[i]; }
  return out;
}

function mix(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const out = new Array<number>(len);
  for (let i = 0; i < len; i++) {
    const s = (a[i] ?? 0) + (b[i] ?? 0);
    out[i] = s > 32767 ? 32767 : s < -32767 ? -32767 : s;
  }
  return out;
}

// ---------- WAV encoder (custom base64 — no btoa) ----------

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encodeBase64(u8: Uint8Array): string {
  const len = u8.length;
  const chars = new Array<string>(Math.ceil(len / 3) * 4);
  let ci = 0;
  for (let i = 0; i < len; i += 3) {
    const b0 = u8[i], b1 = i + 1 < len ? u8[i + 1] : 0, b2 = i + 2 < len ? u8[i + 2] : 0;
    chars[ci++] = B64[b0 >> 2];
    chars[ci++] = B64[((b0 & 3) << 4) | (b1 >> 4)];
    chars[ci++] = i + 1 < len ? B64[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    chars[ci++] = i + 2 < len ? B64[b2 & 63] : '=';
  }
  return chars.join('');
}

function toWav(samples: number[]): string {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  // WAV header (44 bytes, mono 16-bit PCM)
  const h = [0x52,0x49,0x46,0x46, 0,0,0,0, 0x57,0x41,0x56,0x45,
             0x66,0x6D,0x74,0x20, 16,0,0,0, 1,0, 1,0,
             0,0,0,0, 0,0,0,0, 2,0, 16,0,
             0x64,0x61,0x74,0x61, 0,0,0,0];
  for (let i = 0; i < h.length; i++) v.setUint8(i, h[i]);
  v.setUint32(4,  36 + n * 2, true);
  v.setUint32(24, SR,         true);
  v.setUint32(28, SR * 2,     true);
  v.setUint32(40, n * 2,      true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, samples[i], true);
  return encodeBase64(new Uint8Array(buf));
}

// ---------- sound catalogue ----------

export type SoundName =
  | 'reveal' | 'mine'   | 'flag'       | 'unflag'
  | 'combo'  | 'clear'  | 'multiplier' | 'click' | 'highscore';

const ALL: SoundName[] = [
  'reveal', 'mine', 'flag', 'unflag',
  'combo', 'clear', 'multiplier', 'click', 'highscore',
];

function buildSamples(name: SoundName): number[] {
  switch (name) {
    case 'reveal':     return tone(880, 75, 0.5, 8);
    case 'mine':       return mix(noise(550, 0.72, 6, 0.28), mix(tone(80, 500, 0.5, 3), tone(55, 380, 0.32, 2.5)));
    case 'flag':       return join(tone(660, 45, 0.38, 14), tone(880, 55, 0.35, 12));
    case 'unflag':     return chirp(660, 400, 65, 0.38);
    case 'combo':      return join(tone(880, 62, 0.52, 13), gap(18), tone(1100, 62, 0.54, 13), gap(18), tone(1320, 95, 0.58, 9));
    case 'multiplier': return chirp(380, 960, 190, 0.52);
    case 'click':      return tone(1050, 32, 0.28, 18);
    case 'clear':
      return join(
        tone(523, 85, 0.52, 9), gap(12), tone(659, 85, 0.54, 9), gap(12),
        tone(784, 85, 0.56, 9), gap(12), tone(1047, 220, 0.62, 5),
      );
    case 'highscore':
      return join(
        tone(523, 75, 0.58, 10), gap(8), tone(659, 75, 0.58, 10), gap(8),
        tone(784, 75, 0.60, 10), gap(8), tone(1047, 90, 0.62, 9), gap(8),
        tone(1319, 280, 0.68, 4),
      );
    default: return gap(50);
  }
}

// ---------- loader ----------

const loaded: Partial<Record<SoundName, AudioPlayer>> = {};
let initPromise: Promise<void> | null = null;

export function loadSounds(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = _load();
  return initPromise;
}

async function _load(): Promise<void> {
  try {
    await setAudioModeAsync({ playsInSilentModeIOS: true });
  } catch (e) {
    console.warn('[sounds] setAudioMode:', e);
  }

  // Strategy 1 — write to device cache/document directory (dev-client or bare)
  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  const canUseFs = !!dir && typeof FileSystem.writeAsStringAsync === 'function';

  await Promise.all(
    ALL.map(async (name) => {
      const b64 = toWav(buildSamples(name));

      if (canUseFs) {
        try {
          const path = `${dir}tf_${name}.wav`;
          await FileSystem.writeAsStringAsync(path, b64, { encoding: 'base64' });
          loaded[name] = createAudioPlayer({ uri: path });
          return;
        } catch {
          // fall through to strategy 2
        }
      }

      // Strategy 2 — data URI (Expo Go / environments without file-system access)
      try {
        loaded[name] = createAudioPlayer({ uri: `data:audio/wav;base64,${b64}` });
      } catch (e) {
        console.warn(`[sounds] failed for ${name}:`, e);
      }
    }),
  );
}

let soundEnabled = true;
export function setSoundEnabled(on: boolean) { soundEnabled = on; }
export function isSoundEnabled() { return soundEnabled; }

export function playSound(name: SoundName): void {
  if (!soundEnabled) return;
  const player = loaded[name];
  if (!player) return;
  try {
    player.seekTo(0);
    player.play();
  } catch (e) {
    console.warn(`[sounds] play ${name}:`, e);
  }
}
