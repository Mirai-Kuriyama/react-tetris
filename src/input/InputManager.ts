import type { ActionType } from '../core/types';
import { getAction, validKeys } from './keyboardMap';
import * as eventRepeat from './eventRepeat';
import { useGameStore } from '../store/gameStore';
import { getGameController } from '../core/GameController';
import { getAudioManager } from '../audio/AudioManager';
import { want, mergeBlock } from '../core/gameLogic';
import { Block } from '../core/Block';
import { speeds, delays } from '../core/constants';

/** 获取 store 状态 (含 actions) */
const getStore = () => useGameStore.getState();

/** 当前按下的动作 */
let keydownActive: ActionType | null = null;

/** 执行动作 down (按下) */
function actionDown(action: ActionType): void {
  const controller = getGameController();
  const audio = getAudioManager();

  // 更新键盘状态
  const keyboardKey = action === 'space' ? 'drop' : action;
  getStore().setKeyboard(keyboardKey as any, true);

  const state = getStore();

  if (action === 'left' || action === 'right' || action === 'down' || action === 'rotate') {
    if (state.cur !== null) {
      handleMove(action, controller, audio);
    } else {
      handleSetup(action, audio);
    }
  } else if (action === 'space') {
    handleSpace(controller, audio);
  } else if (action === 'r') {
    handleReset(controller);
  } else if (action === 'p') {
    handlePause(controller);
  } else if (action === 's') {
    handleSound();
  }
}

/** 执行动作 up (释放) */
function actionUp(action: ActionType): void {
  const keyboardKey = action === 'space' ? 'drop' : action;
  getStore().setKeyboard(keyboardKey as any, false);
  eventRepeat.up({ key: action });
}

/** 处理移动/旋转 */
function handleMove(
  action: 'left' | 'right' | 'down' | 'rotate',
  controller: ReturnType<typeof getGameController>,
  audio: ReturnType<typeof getAudioManager>,
): void {
  if (getStore().lock) return;

  if (getStore().pause) {
    controller.pause(false);
    return;
  }

  const cur = getStore().cur;
  if (!cur) return;

  const block = cur instanceof Block ? cur : new Block(cur);

  if (action === 'rotate') {
    audio?.play('rotate');
    eventRepeat.down({
      key: 'rotate',
      once: true,
      callback: () => {
        const s = getStore();
        if (s.lock || !s.cur) return;
        const b = s.cur instanceof Block ? s.cur : new Block(s.cur);
        const next = b.rotate();
        if (want(next, s.matrix)) {
          s.setCur(next);
        }
      },
    });
  } else if (action === 'down') {
    audio?.play('move');
    eventRepeat.down({
      key: 'down',
      begin: 40,
      interval: 40,
      callback: (stopDownTrigger) => {
        const s = getStore();
        if (s.lock || !s.cur) return;
        if (s.pause) {
          controller.pause(false);
          return;
        }
        const b = s.cur instanceof Block ? s.cur : new Block(s.cur);
        const next = b.fall();
        if (want(next, s.matrix)) {
          s.setCur(next);
          controller.auto();
        } else {
          const matrix = mergeBlock(s.matrix, b);
          controller.nextAround(matrix, stopDownTrigger);
        }
      },
    });
  } else if (action === 'left' || action === 'right') {
    audio?.play('move');
    eventRepeat.down({
      key: action,
      begin: 200,
      interval: 100,
      callback: () => {
        const s = getStore();
        if (s.lock || !s.cur) return;
        if (s.pause) {
          controller.pause(false);
          return;
        }
        const b = s.cur instanceof Block ? s.cur : new Block(s.cur);
        const next = action === 'left' ? b.left() : b.right();
        const delay = delays[s.speedRun - 1];
        if (want(next, s.matrix)) {
          next.timeStamp += delay;
          s.setCur(next);
        } else {
          b.timeStamp += Math.floor(delay / 1.5);
          s.setCur(b);
        }
        const remain = speeds[s.speedRun - 1] - (Date.now() - (next === b ? b.timeStamp : next.timeStamp));
        controller.auto(remain);
      },
    });
  }
}

/** 处理待机状态的设置 */
function handleSetup(
  action: 'left' | 'right' | 'down' | 'rotate',
  audio: ReturnType<typeof getAudioManager>,
): void {
  if (getStore().lock) return;

  if (action === 'left' || action === 'right') {
    audio?.play('move');
    eventRepeat.down({
      key: action,
      begin: 200,
      interval: 100,
      callback: () => {
        const s = getStore();
        if (s.lock || s.cur) return;
        let speed = s.speedStart;
        if (action === 'left') {
          speed = speed - 1 < 1 ? 6 : speed - 1;
        } else {
          speed = speed + 1 > 6 ? 1 : speed + 1;
        }
        s.setSpeedStart(speed);
      },
    });
  } else if (action === 'down' || action === 'rotate') {
    audio?.play('move');
    eventRepeat.down({
      key: action,
      begin: 200,
      interval: 100,
      callback: () => {
        const s = getStore();
        if (s.lock || s.cur) return;
        let lines = s.startLines;
        if (action === 'down') {
          lines = lines - 1 < 0 ? 10 : lines - 1;
        } else {
          lines = lines + 1 > 10 ? 0 : lines + 1;
        }
        s.setStartLines(lines);
      },
    });
  }
}

/** 处理空格 (掉落/开始) */
function handleSpace(
  controller: ReturnType<typeof getGameController>,
  audio: ReturnType<typeof getAudioManager>,
): void {
  eventRepeat.down({
    key: 'space',
    once: true,
    callback: () => {
      const s = getStore();
      if (s.lock) return;
      if (s.cur !== null) {
        // 置底
        if (s.pause) {
          controller.pause(false);
          return;
        }
        audio?.play('fall');
        const b = s.cur instanceof Block ? s.cur : new Block(s.cur);
        let index = 0;
        let bottom = b.fall(index);
        while (want(bottom, s.matrix)) {
          bottom = b.fall(index);
          index++;
        }
        const finalBlock = b.fall(index - 2);
        s.setCur(finalBlock);
        const matrix = mergeBlock(s.matrix, finalBlock);
        s.setDrop(true);
        setTimeout(() => s.setDrop(false), 100);
        controller.nextAround(matrix);
      } else {
        // 开始游戏
        controller.start();
      }
    },
  });
}

/** 处理重置 */
function handleReset(
  controller: ReturnType<typeof getGameController>,
): void {
  if (getStore().lock) return;
  eventRepeat.down({
    key: 'r',
    once: true,
    callback: () => {
      if (getStore().cur !== null) {
        controller.overStart();
      } else {
        if (getStore().lock) return;
        controller.start();
      }
    },
  });
}

/** 处理暂停 */
function handlePause(
  controller: ReturnType<typeof getGameController>,
): void {
  eventRepeat.down({
    key: 'p',
    once: true,
    callback: () => {
      const s = getStore();
      if (s.lock) return;
      if (s.cur !== null) {
        controller.pause(!s.pause);
      } else {
        controller.start();
      }
    },
  });
}

/** 处理音效开关 */
function handleSound(): void {
  eventRepeat.down({
    key: 's',
    once: true,
    callback: () => {
      const s = getStore();
      if (s.lock) return;
      s.setMusic(!s.music);
    },
  });
}

/** 键盘按下处理 */
function onKeyDown(e: KeyboardEvent): void {
  if (e.metaKey || !validKeys.has(e.key)) return;
  e.preventDefault();
  const action = getAction(e.key);
  if (!action) return;
  if (action === keydownActive) return;
  keydownActive = action;
  actionDown(action);
}

/** 键盘释放处理 */
function onKeyUp(e: KeyboardEvent): void {
  if (e.metaKey || !validKeys.has(e.key)) return;
  e.preventDefault();
  const action = getAction(e.key);
  if (!action) return;
  if (action === keydownActive) {
    keydownActive = null;
  }
  actionUp(action);
}

/** 阻止触摸默认行为 */
function preventDefault(e: Event): void {
  if (e.preventDefault) e.preventDefault();
}

/** 初始化输入系统 */
export function initInput(): void {
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('keyup', onKeyUp, true);

  document.addEventListener('touchstart', preventDefault, { passive: false, capture: true });
  document.addEventListener('touchend', preventDefault, { passive: false, capture: true });
  document.addEventListener('gesturestart', preventDefault);
  document.addEventListener('mousedown', preventDefault, { capture: true });
}

/** 为按钮 DOM 元素绑定触摸事件 */
export function bindButtonEvent(
  el: HTMLElement,
  action: ActionType,
): () => void {
  let touchActive = false;

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    touchActive = true;
    actionDown(action);
  };

  const onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    touchActive = false;
    actionUp(action);
  };

  const onMouseDown = () => {
    if (touchActive) return;
    actionDown(action);
  };

  const onMouseUp = () => {
    if (touchActive) return;
    actionUp(action);
  };

  const onMouseOut = () => {
    if (touchActive) return;
    actionUp(action);
  };

  el.addEventListener('touchstart', onTouchStart, { capture: true });
  el.addEventListener('touchend', onTouchEnd, { capture: true });
  el.addEventListener('mousedown', onMouseDown, { capture: true });
  el.addEventListener('mouseup', onMouseUp, { capture: true });
  el.addEventListener('mouseout', onMouseOut, { capture: true });

  return () => {
    el.removeEventListener('touchstart', onTouchStart, { capture: true });
    el.removeEventListener('touchend', onTouchEnd, { capture: true });
    el.removeEventListener('mousedown', onMouseDown, { capture: true });
    el.removeEventListener('mouseup', onMouseUp, { capture: true });
    el.removeEventListener('mouseout', onMouseOut, { capture: true });
  };
}
