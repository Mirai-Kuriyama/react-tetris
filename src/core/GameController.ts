import type { BlockData, MatrixData } from './types';
import { speeds, blankLine, blankMatrix, clearPoints, eachLines } from './constants';
import { want, isClear, isOver, mergeBlock, clearMatrixLines, getStartMatrix, getNextType } from './gameLogic';
import { Block } from './Block';
import type { GameStoreApi } from '../store/gameStore';

/**
 * 游戏状态机: 管理游戏流程
 * 通过依赖注入 store, 解耦状态访问
 */
class GameController {
  private store: GameStoreApi;
  private fallInterval: ReturnType<typeof setTimeout> | null = null;

  constructor(store: GameStoreApi) {
    this.store = store;
  }

  /** 获取当前状态 (含 actions) */
  private get state() {
    return this.store.getState();
  }

  /** 游戏开始 */
  start(): void {
    const { audioManager } = this;
    audioManager?.play('start');
    const state = this.state;
    this.dispatchPoints(0);
    state.setSpeedRun(state.speedStart);
    const startMatrix = getStartMatrix(state.startLines);
    state.setMatrix(startMatrix);
    state.setCur(new Block({ type: state.next }));
    state.setNext(getNextType());
    this.auto();
  }

  /** 音频管理器 (由外部设置) */
  audioManager: { play: (segment: 'start' | 'clear' | 'fall' | 'gameover' | 'rotate' | 'move') => void } | null = null;

  /** 自动下落 */
  auto(timeout?: number): void {
    const out = timeout && timeout < 0 ? 0 : timeout;
    const state = this.state;
    const cur = state.cur;
    if (!cur) return;

    const fall = () => {
      const s = this.state;
      const c = s.cur;
      if (!c) return;
      const block = c instanceof Block ? c : new Block(c);
      const next = block.fall();
      if (want(next, s.matrix)) {
        s.setCur(next);
        this.fallInterval = setTimeout(fall, speeds[s.speedRun - 1]);
      } else {
        const matrix = mergeBlock(s.matrix, block);
        this.nextAround(matrix);
      }
    };

    this.clearFallInterval();
    this.fallInterval = setTimeout(fall,
      out === undefined ? speeds[state.speedRun - 1] : out);
  }

  /** 一个方块结束, 触发下一个 */
  nextAround(matrix: MatrixData, stopDownTrigger?: () => void): void {
    this.clearFallInterval();
    const s = this.state;
    s.setLock(true);
    s.setMatrix(matrix);
    if (typeof stopDownTrigger === 'function') {
      stopDownTrigger();
    }

    const addPoints = (s.points + 10) + ((s.speedRun - 1) * 2);
    this.dispatchPoints(addPoints);

    const clears = isClear(matrix);
    if (clears) {
      s.setClearingLines(clears);
      this.audioManager?.play('clear');
      return;
    }
    if (isOver(matrix)) {
      this.audioManager?.play('gameover');
      this.overStart();
      return;
    }
    setTimeout(() => {
      const cur = this.state;
      cur.setLock(false);
      cur.setCur(new Block({ type: cur.next }));
      cur.setNext(getNextType());
      this.auto();
    }, 100);
  }

  /** 页面焦点变换 */
  focus(isFocus: boolean): void {
    this.state.setFocus(isFocus);
    if (!isFocus) {
      this.clearFallInterval();
      return;
    }
    const state = this.state;
    if (state.cur && !state.reset && !state.pause) {
      this.auto();
    }
  }

  /** 暂停 */
  pause(isPause: boolean): void {
    this.state.setPause(isPause);
    if (isPause) {
      this.clearFallInterval();
      return;
    }
    this.auto();
  }

  /** 消除行 */
  clearLines(matrix: MatrixData, lines: number[]): void {
    const state = this.state;
    const newMatrix = clearMatrixLines(matrix, lines);
    state.setMatrix(newMatrix);
    state.setCur(new Block({ type: state.next }));
    state.setNext(getNextType());
    this.auto();
    state.setLock(false);
    state.setClearingLines([]);
    const newClearLines = state.clearLines + lines.length;
    state.setClearLines(newClearLines);

    const addPoints = this.state.points + clearPoints[lines.length - 1];
    this.dispatchPoints(addPoints);

    const speedAdd = Math.floor(newClearLines / eachLines);
    let speedNow = state.speedStart + speedAdd;
    speedNow = speedNow > 6 ? 6 : speedNow;
    this.state.setSpeedRun(speedNow);
  }

  /** 游戏结束, 触发动画 */
  overStart(): void {
    this.clearFallInterval();
    const s = this.state;
    s.setLock(true);
    s.setReset(true);
    s.setPause(false);
  }

  /** 游戏结束动画完成 */
  overEnd(): void {
    const s = this.state;
    s.setMatrix(blankMatrix.map((row) => [...row]));
    s.setCur(null);
    s.setReset(false);
    s.setLock(false);
    s.setClearLines(0);
  }

  /** 写入分数, 同时判断是否创造最高分 */
  dispatchPoints(point: number): void {
    const s = this.state;
    s.setPoints(point);
    if (point > 0 && point > s.max) {
      s.setMax(point);
    }
  }

  /** 清除下落定时器 */
  private clearFallInterval(): void {
    if (this.fallInterval) {
      clearTimeout(this.fallInterval);
      this.fallInterval = null;
    }
  }
}

/** 全局游戏控制器实例 */
let controller: GameController | null = null;

/** 获取游戏控制器 (单例) */
export function getGameController(): GameController {
  if (!controller) {
    throw new Error('GameController not initialized');
  }
  return controller;
}

/** 初始化游戏控制器 */
export function initGameController(store: GameStoreApi): GameController {
  controller = new GameController(store);
  return controller;
}

export { GameController };
