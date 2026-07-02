import { create } from 'zustand';
import type { BlockData, BlockType, GameState, KeyboardState, MatrixData } from '../core/types';
import { BLOCK_TYPES } from '../core/types';
import { blankMatrix, maxPoint } from '../core/constants';
import { getNextType } from '../core/gameLogic';
import { Block } from '../core/Block';
import { loadState } from '../storage/persist';

/** 从 localStorage 加载初始状态 */
function getInitialState(): GameState {
  const record = loadState();
  const w = window as any;
  const hasWebAudio = typeof window !== 'undefined' &&
    (w.AudioContext || w.webkitAudioContext) &&
    location.protocol.indexOf('http') !== -1;

  const r = record || {};

  const matrix: MatrixData = Array.isArray(r.matrix)
    ? r.matrix.map((row: number[]) => [...row])
    : blankMatrix.map((row) => [...row]);

  let next: BlockType = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
  if (BLOCK_TYPES.includes(r.next as BlockType)) {
    next = r.next as BlockType;
  }

  let cur: BlockData | null = null;
  if (r.cur) {
    const c = r.cur;
    cur = new Block({
      type: c.type as BlockType,
      shape: c.shape,
      xy: c.xy,
      rotateIndex: c.rotateIndex,
      timeStamp: c.timeStamp,
    });
  }

  const num = (v: unknown, def: number, min: number, max: number): number => {
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    if (isNaN(n)) return def;
    return Math.max(min, Math.min(max, n));
  };

  return {
    pause: !!r.pause,
    music: hasWebAudio ? (r.music !== undefined ? !!r.music : true) : false,
    matrix,
    next,
    cur,
    startLines: num(r.startLines, 0, 0, 10),
    max: num(r.max, 0, 0, maxPoint),
    points: num(r.points, 0, 0, maxPoint),
    speedStart: num(r.speedStart, 1, 1, 6),
    speedRun: num(r.speedRun, 1, 1, 6),
    lock: !!r.lock,
    clearLines: num(r.clearLines, 0, 0, 999999),
    clearingLines: [],
    reset: !!r.reset,
    drop: !!r.drop,
    keyboard: {
      drop: false, down: false, left: false, right: false,
      rotate: false, reset: false, music: false, pause: false,
    },
    focus: typeof document !== 'undefined' ? !document.hidden : true,
  };
}

/** Zustand store 接口 (状态 + Actions) */
export interface GameStore extends GameState {
  // Actions
  setPause: (v: boolean) => void;
  setMusic: (v: boolean) => void;
  setMatrix: (m: MatrixData) => void;
  setNext: (n: BlockType) => void;
  setCur: (c: BlockData | null) => void;
  setStartLines: (n: number) => void;
  setMax: (n: number) => void;
  setPoints: (n: number) => void;
  setSpeedStart: (n: number) => void;
  setSpeedRun: (n: number) => void;
  setLock: (v: boolean) => void;
  setClearLines: (n: number) => void;
  setClearingLines: (lines: number[]) => void;
  setReset: (v: boolean) => void;
  setDrop: (v: boolean) => void;
  setFocus: (v: boolean) => void;
  setKeyboard: (key: keyof KeyboardState, value: boolean) => void;
  moveBlock: (data: BlockData) => void;
  nextBlock: (next?: BlockType) => void;
}

/** Zustand Store API 类型 (含 getState/setState + 所有 actions) */
export type GameStoreApi = {
  getState: () => GameStore;
  setState: (partial: Partial<GameStore>) => void;
  subscribe: (listener: (state: GameStore, prevState: GameStore) => void) => () => void;
  destroy: () => void;
} & GameStore;

export const useGameStore = create<GameStore>((set) => ({
  ...getInitialState(),

  // Actions
  setPause: (v) => set({ pause: v }),
  setMusic: (v) => set({ music: v }),
  setMatrix: (m) => set({ matrix: m }),
  setNext: (n) => set({ next: n }),
  setCur: (c) => set({ cur: c }),
  setStartLines: (n) => set({ startLines: n }),
  setMax: (n) => set({ max: Math.min(n, maxPoint) }),
  setPoints: (n) => set({ points: Math.min(n, maxPoint) }),
  setSpeedStart: (n) => set({ speedStart: n }),
  setSpeedRun: (n) => set({ speedRun: n }),
  setLock: (v) => set({ lock: v }),
  setClearLines: (n) => set({ clearLines: n }),
  setClearingLines: (lines) => set({ clearingLines: lines }),
  setReset: (v) => set({ reset: v }),
  setDrop: (v) => set({ drop: v }),
  setFocus: (v) => set({ focus: v }),
  setKeyboard: (key, value) => set((state) => ({
    keyboard: { ...state.keyboard, [key]: value },
  })),
  moveBlock: (data) => set({ cur: data }),
  nextBlock: (next) => set({ next: next ?? getNextType() }),
}));
