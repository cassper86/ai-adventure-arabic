import { audioGenerator } from '../utils/audioGenerator';

export const useSoundEffect = () => {
  const playClick = () => {
    audioGenerator.playClickSound();
  };

  const playVictory = () => {
    audioGenerator.playVictorySound();
  };

  return {
    playClick,
    playVictory,
  };
};