import type { GameState } from '../core/types';
import { StorageKey } from '../core/constants';

/** 可序列化的游戏状态 (不含 Block 实例, 只含数据) */
export type SerializableState = Omit<GameState, 'cur'> & {
  cur: {
    type: string;
    shape: number[][];
    xy: [number, number];
    rotateIndex: number;
    timeStamp: number;
  } | null;
};

/** 从 localStorage 读取游戏状态 */
export function loadState(): Partial<SerializableState> | false {
  try {
    const data = localStorage.getItem(StorageKey);
    if (!data) return false;
    return JSON.parse(data);
  } catch (e) {
    console.error('读取记录错误:', e);
    return false;
  }
}

/** 防抖写入定时器 */
let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** 将游戏状态保存到 localStorage (防抖) */
export function saveState(state: GameState): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const serializable: SerializableState = {
        ...state,
        cur: state.cur ? {
          type: state.cur.type,
          shape: state.cur.shape,
          xy: state.cur.xy,
          rotateIndex: state.cur.rotateIndex,
          timeStamp: state.cur.timeStamp,
        } : null,
      };
      localStorage.setItem(StorageKey, JSON.stringify(serializable));
    } catch (e) {
      console.error('保存记录错误:', e);
    }
  }, 200);
}

/** 订阅 Zustand store 变化, 自动持久化 */
export function subscribePersist(store: { getState: () => GameState; subscribe: (cb: () => void) => () => void }) {
  let prevState = store.getState();
  store.subscribe(() => {
    const state = store.getState();
    // 当锁定状态时不记录
    if (state.lock) return;
    saveState(state);
    prevState = state;
  });
}
