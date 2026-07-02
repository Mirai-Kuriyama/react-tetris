import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loadState, saveState, subscribePersist } from './persist';
import { StorageKey } from '../core/constants';
import type { GameState, BlockData } from '../core/types';
import { blankMatrix } from '../core/constants';

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('无存储时返回 false', () => {
    expect(loadState()).toBe(false);
  });

  it('正确解析已存储的数据', () => {
    const data = { points: 100, max: 500, speedStart: 2 };
    localStorage.setItem(StorageKey, JSON.stringify(data));
    const result = loadState();
    expect(result).toEqual(data);
  });

  it('JSON 解析错误时返回 false', () => {
    localStorage.setItem(StorageKey, 'invalid-json{');
    const result = loadState();
    expect(result).toBe(false);
  });
});

describe('saveState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('200ms 后写入 localStorage', () => {
    const state: GameState = {
      pause: false, music: true, matrix: blankMatrix.map((r) => [...r]),
      next: 'I', cur: null, startLines: 0, max: 0, points: 100,
      speedStart: 1, speedRun: 1, lock: false, clearLines: 0,
      clearingLines: [], reset: false, drop: false,
      keyboard: {
        drop: false, down: false, left: false, right: false,
        rotate: false, reset: false, music: false, pause: false,
      },
      focus: true,
    };
    saveState(state);
    // 防抖 200ms, 此时不应该写入
    expect(localStorage.getItem(StorageKey)).toBeNull();
    vi.advanceTimersByTime(200);
    expect(localStorage.getItem(StorageKey)).not.toBeNull();
    const parsed = JSON.parse(localStorage.getItem(StorageKey)!);
    expect(parsed.points).toBe(100);
  });

  it('序列化 Block 数据 (不保留实例)', () => {
    const block: BlockData = {
      type: 'O', shape: [[1, 1], [1, 1]], xy: [5, 4],
      rotateIndex: 0, timeStamp: 12345,
    };
    const state: GameState = {
      pause: false, music: false, matrix: blankMatrix.map((r) => [...r]),
      next: 'T', cur: block, startLines: 0, max: 0, points: 0,
      speedStart: 1, speedRun: 1, lock: false, clearLines: 0,
      clearingLines: [], reset: false, drop: false,
      keyboard: {
        drop: false, down: false, left: false, right: false,
        rotate: false, reset: false, music: false, pause: false,
      },
      focus: true,
    };
    saveState(state);
    vi.advanceTimersByTime(200);
    const parsed = JSON.parse(localStorage.getItem(StorageKey)!);
    expect(parsed.cur).toEqual({
      type: 'O', shape: [[1, 1], [1, 1]], xy: [5, 4],
      rotateIndex: 0, timeStamp: 12345,
    });
  });

  it('cur 为 null 时序列化为 null', () => {
    const state: GameState = {
      pause: false, music: false, matrix: blankMatrix.map((r) => [...r]),
      next: 'I', cur: null, startLines: 0, max: 0, points: 0,
      speedStart: 1, speedRun: 1, lock: false, clearLines: 0,
      clearingLines: [], reset: false, drop: false,
      keyboard: {
        drop: false, down: false, left: false, right: false,
        rotate: false, reset: false, music: false, pause: false,
      },
      focus: true,
    };
    saveState(state);
    vi.advanceTimersByTime(200);
    const parsed = JSON.parse(localStorage.getItem(StorageKey)!);
    expect(parsed.cur).toBeNull();
  });

  it('多次调用只写入最后一次 (防抖)', () => {
    const state1: GameState = {
      pause: false, music: false, matrix: blankMatrix.map((r) => [...r]),
      next: 'I', cur: null, startLines: 0, max: 0, points: 10,
      speedStart: 1, speedRun: 1, lock: false, clearLines: 0,
      clearingLines: [], reset: false, drop: false,
      keyboard: {
        drop: false, down: false, left: false, right: false,
        rotate: false, reset: false, music: false, pause: false,
      },
      focus: true,
    };
    const state2 = { ...state1, points: 999 };
    saveState(state1);
    vi.advanceTimersByTime(100);
    saveState(state2);
    vi.advanceTimersByTime(200);
    const parsed = JSON.parse(localStorage.getItem(StorageKey)!);
    expect(parsed.points).toBe(999);
  });
});

describe('subscribePersist', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('store 变化时保存状态', () => {
    let callCount = 0;
    const mockStore = {
      getState: () => ({
        pause: false, music: false, matrix: [], next: 'I',
        cur: null, startLines: 0, max: 0, points: 42,
        speedStart: 1, speedRun: 1, lock: false, clearLines: 0,
        clearingLines: [], reset: false, drop: false,
        keyboard: {
          drop: false, down: false, left: false, right: false,
          rotate: false, reset: false, music: false, pause: false,
        },
        focus: true,
      } as GameState),
      subscribe: (cb: () => void) => {
        callCount++;
        // 模拟状态变化通知
        setTimeout(cb, 0);
        return () => {};
      },
    };
    subscribePersist(mockStore);
    vi.advanceTimersByTime(1);
    vi.advanceTimersByTime(200);
    const parsed = JSON.parse(localStorage.getItem(StorageKey)!);
    expect(parsed.points).toBe(42);
  });

  it('lock 状态时不保存', () => {
    const mockStore = {
      getState: () => ({
        pause: false, music: false, matrix: [], next: 'I',
        cur: null, startLines: 0, max: 0, points: 100,
        speedStart: 1, speedRun: 1,
        lock: true, // 锁定状态
        clearLines: 0, clearingLines: [], reset: false, drop: false,
        keyboard: {
          drop: false, down: false, left: false, right: false,
          rotate: false, reset: false, music: false, pause: false,
        },
        focus: true,
      } as GameState),
      subscribe: (cb: () => void) => {
        setTimeout(cb, 0);
        return () => {};
      },
    };
    subscribePersist(mockStore);
    vi.advanceTimersByTime(1);
    vi.advanceTimersByTime(200);
    expect(localStorage.getItem(StorageKey)).toBeNull();
  });
});
