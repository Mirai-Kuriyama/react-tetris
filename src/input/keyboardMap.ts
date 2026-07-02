import type { ActionType } from '../core/types';

/** 键盘按键 → 动作映射 (使用 e.key) */
export const keyboardMap: Record<string, ActionType> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'rotate',
  ArrowDown: 'down',
  ' ': 'space',
  s: 's',
  S: 's',
  r: 'r',
  R: 'r',
  p: 'p',
  P: 'p',
};

/** 所有有效按键 */
export const validKeys = new Set(Object.keys(keyboardMap));

/** 获取按键对应的动作 */
export function getAction(key: string): ActionType | undefined {
  return keyboardMap[key];
}
