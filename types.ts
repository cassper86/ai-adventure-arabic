export enum GameState {
  LANDING = 'LANDING',
  PLAYER_ENTRY = 'PLAYER_ENTRY',
  MAP = 'MAP',
  PLAYING_3D = 'PLAYING_3D',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER'
}

export interface PlayerStats {
  score: number;
  level: number;
}