import { useEffect, useState } from 'react';
import { hasSeenTutorial, markTutorialSeen } from '../lib/storage';

export type TutorialHighlight = 'multiplier' | 'score' | 'grid' | 'none';

export interface TutorialStepConfig {
  emoji: string;
  title: string;
  body: string;
  buttonLabel: string;
  highlight: TutorialHighlight;
  cardPosition: 'top' | 'center' | 'bottom';
  danger?: boolean;
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    emoji: '💣',
    title: 'WELCOME TO\nTRIGGER FIELD',
    body: "A minefield is waiting. One wrong tap ends your run — for good. Let's run through the basics before you step in.",
    buttonLabel: "Let's Go →",
    highlight: 'none',
    cardPosition: 'center',
  },
  {
    emoji: '👆',
    title: 'TAP TO REVEAL',
    body: 'Tap any cell on the grid to reveal it. Your very first tap is always safe — mines are placed only after that.',
    buttonLabel: 'Got it →',
    highlight: 'grid',
    cardPosition: 'top',
  },
  {
    emoji: '🔢',
    title: 'READ THE NUMBERS',
    body: 'A number shows how many mines touch that cell. Empty cells auto-reveal all their neighbors — chain reactions are your best friend.',
    buttonLabel: 'Got it →',
    highlight: 'grid',
    cardPosition: 'top',
  },
  {
    emoji: '🚩',
    title: 'FLAG SUSPECTED MINES',
    body: 'Switch to FLAG mode using the 🚩 button below the grid, then tap a cell to mark it. The mine counter tracks unflagged mines.',
    buttonLabel: 'Got it →',
    highlight: 'score',
    cardPosition: 'bottom',
  },
  {
    emoji: '⚡',
    title: 'MULTIPLIER & COMBOS',
    body: 'Clear a room → next room gets +0.2× multiplier. Reveal cells within 0.8 s of each other for COMBO bonus points — the faster, the better!',
    buttonLabel: 'Got it →',
    highlight: 'multiplier',
    cardPosition: 'bottom',
  },
  {
    emoji: '☠️',
    title: 'ONE LIFE. NO MERCY.',
    body: 'Hit a mine and it is over. No continues, no second chances. Every single tap counts.',
    buttonLabel: "I'm Ready 💪",
    highlight: 'none',
    cardPosition: 'center',
    danger: true,
  },
];

export function useTutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    hasSeenTutorial().then(seen => {
      if (!seen) setVisible(true);
    });
  }, []);

  function nextStep() {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      markTutorialSeen();
      setVisible(false);
    }
  }

  const currentStep = TUTORIAL_STEPS[step];
  const highlight: TutorialHighlight = visible ? currentStep.highlight : 'none';

  return {
    visible,
    step,
    currentStep,
    highlight,
    nextStep,
    totalSteps: TUTORIAL_STEPS.length,
  };
}
