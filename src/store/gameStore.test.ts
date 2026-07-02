import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { blankMatrix, maxPoint } from '../core/constants';
import type { BlockData, BlockType, MatrixData, KeyboardState } from '../core/types';
import { BLOCK_TYPES } from '../core/types';

describe('gameStore 初始状态', () => {
  beforeEach(() => {
    // 重置 store 状态
    useGameStore.setState({
      pause: false,
      music: false,
      matrix: blankMatrix.map((r) => [...r]),
      next: 'I' as BlockType,
      cur: null,
      startLines: 0,
      max: 0,
      points: 0,
      speedStart: 1,
      speedRun: 1,
      lock: false,
      clearLines: 0,
      clearingLines: [],
      reset: false,
      drop: false,
      keyboard: {
        drop: false, down: false, left: false, right: false,
        rotate: false, reset: false, music: false, pause: false,
      },
      focus: true,
    });
  });

  it('初始 matrix 为空矩阵', () => {
    const state = useGameStore.getState();
    expect(state.matrix.length).toBe(20);
    state.matrix.forEach((row) => {
      expect(row.every((c) => c === 0)).toBe(true);
    });
  });

  it('初始 cur 为 null', () => {
    expect(useGameStore.getState().cur).toBeNull();
  });

  it('初始 lock 为 false', () => {
    expect(useGameStore.getState().lock).toBe(false);
  });

  it('初始 clearingLines 为空数组', () => {
    expect(useGameStore.getState().clearingLines).toEqual([]);
  });
});

describe('gameStore Actions', () => {
  beforeEach(() => {
    useGameStore.setState({ pause: false, music: false, lock: false, points: 0, max: 0 });
  });

  it('setPause', () => {
    useGameStore.getState().setPause(true);
    expect(useGameStore.getState().pause).toBe(true);
    useGameStore.getState().setPause(false);
    expect(useGameStore.getState().pause).toBe(false);
  });

  it('setMusic', () => {
    useGameStore.getState().setMusic(true);
    expect(useGameStore.getState().music).toBe(true);
  });

  it('setMatrix', () => {
    const matrix: MatrixData = blankMatrix.map((r) => [...r]);
    matrix[19][5] = 1;
    useGameStore.getState().setMatrix(matrix);
    expect(useGameStore.getState().matrix[19][5]).toBe(1);
  });

  it('setNext', () => {
    useGameStore.getState().setNext('T');
    expect(useGameStore.getState().next).toBe('T');
  });

  it('setCur', () => {
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [10, 4],
      rotateIndex: 0,
      timeStamp: 1000,
    };
    useGameStore.getState().setCur(block);
    expect(useGameStore.getState().cur).toEqual(block);
  });

  it('setLock', () => {
    useGameStore.getState().setLock(true);
    expect(useGameStore.getState().lock).toBe(true);
  });

  it('setClearingLines', () => {
    useGameStore.getState().setClearingLines([18, 19]);
    expect(useGameStore.getState().clearingLines).toEqual([18, 19]);
  });

  it('setReset', () => {
    useGameStore.getState().setReset(true);
    expect(useGameStore.getState().reset).toBe(true);
  });

  it('setDrop', () => {
    useGameStore.getState().setDrop(true);
    expect(useGameStore.getState().drop).toBe(true);
  });

  it('setFocus', () => {
    useGameStore.getState().setFocus(false);
    expect(useGameStore.getState().focus).toBe(false);
  });

  it('setMax 上限为 maxPoint', () => {
    useGameStore.getState().setMax(maxPoint + 1000);
    expect(useGameStore.getState().max).toBe(maxPoint);
  });

  it('setPoints 上限为 maxPoint', () => {
    useGameStore.getState().setPoints(maxPoint + 5000);
    expect(useGameStore.getState().points).toBe(maxPoint);
  });

  it('setSpeedStart', () => {
    useGameStore.getState().setSpeedStart(3);
    expect(useGameStore.getState().speedStart).toBe(3);
  });

  it('setSpeedRun', () => {
    useGameStore.getState().setSpeedRun(5);
    expect(useGameStore.getState().speedRun).toBe(5);
  });

  it('setClearLines', () => {
    useGameStore.getState().setClearLines(40);
    expect(useGameStore.getState().clearLines).toBe(40);
  });

  it('setStartLines', () => {
    useGameStore.getState().setStartLines(5);
    expect(useGameStore.getState().startLines).toBe(5);
  });
});

describe('gameStore setKeyboard', () => {
  beforeEach(() => {
    useGameStore.setState({
      keyboard: {
        drop: false, down: false, left: false, right: false,
        rotate: false, reset: false, music: false, pause: false,
      } as KeyboardState,
    });
  });

  it('更新单个按键状态', () => {
    useGameStore.getState().setKeyboard('left', true);
    expect(useGameStore.getState().keyboard.left).toBe(true);
    expect(useGameStore.getState().keyboard.right).toBe(false);
  });

  it('不影响其他按键', () => {
    useGameStore.getState().setKeyboard('left', true);
    useGameStore.getState().setKeyboard('right', true);
    expect(useGameStore.getState().keyboard.left).toBe(true);
    expect(useGameStore.getState().keyboard.right).toBe(true);
    expect(useGameStore.getState().keyboard.rotate).toBe(false);
  });

  it('可以切换按键状态', () => {
    useGameStore.getState().setKeyboard('rotate', true);
    expect(useGameStore.getState().keyboard.rotate).toBe(true);
    useGameStore.getState().setKeyboard('rotate', false);
    expect(useGameStore.getState().keyboard.rotate).toBe(false);
  });
});

describe('gameStore moveBlock', () => {
  it('moveBlock 设置 cur', () => {
    const block: BlockData = {
      type: 'L',
      shape: [[0, 0, 1], [1, 1, 1]],
      xy: [5, 3],
      rotateIndex: 0,
      timeStamp: 2000,
    };
    useGameStore.getState().moveBlock(block);
    expect(useGameStore.getState().cur).toEqual(block);
  });

  it('moveBlock 替换已有 cur', () => {
    const block1: BlockData = {
      type: 'O', shape: [[1, 1], [1, 1]], xy: [0, 0],
      rotateIndex: 0, timeStamp: 0,
    };
    const block2: BlockData = {
      type: 'I', shape: [[1, 1, 1, 1]], xy: [5, 3],
      rotateIndex: 0, timeStamp: 1000,
    };
    useGameStore.getState().moveBlock(block1);
    useGameStore.getState().moveBlock(block2);
    expect(useGameStore.getState().cur).toEqual(block2);
  });
});

describe('gameStore nextBlock', () => {
  it('nextBlock 设置指定类型', () => {
    useGameStore.getState().nextBlock('Z');
    expect(useGameStore.getState().next).toBe('Z');
  });

  it('nextBlock 无参数时随机生成', () => {
    useGameStore.getState().nextBlock();
    const next = useGameStore.getState().next;
    expect(BLOCK_TYPES).toContain(next);
  });
});
