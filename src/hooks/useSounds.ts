import { useEffect } from 'react';
import { loadSounds, playSound, SoundName } from '../lib/sounds';

export function useSounds() {
  useEffect(() => {
    loadSounds();
  }, []);

  return (name: SoundName) => playSound(name);
}
