import { describe, it, expect } from 'vitest';
import { keyboardMap, validKeys, getAction } from './keyboardMap';
import type { ActionType } from '../core/types';

describe('keyboardMap', () => {
  it('方向键映射正确', () => {
    expect(keyboardMap['ArrowLeft']).toBe('left');
    expect(keyboardMap['ArrowRight']).toBe('right');
    expect(keyboardMap['ArrowUp']).toBe('rotate');
    expect(keyboardMap['ArrowDown']).toBe('down');
  });

  it('空格键映射为 space', () => {
    expect(keyboardMap[' ']).toBe('space');
  });

  it('s/S 键映射为 s (开始/暂停)', () => {
    expect(keyboardMap['s']).toBe('s');
    expect(keyboardMap['S']).toBe('s');
  });

  it('r/R 键映射为 r (重置)', () => {
    expect(keyboardMap['r']).toBe('r');
    expect(keyboardMap['R']).toBe('r');
  });

  it('p/P 键映射为 p (暂停)', () => {
    expect(keyboardMap['p']).toBe('p');
    expect(keyboardMap['P']).toBe('p');
  });

  it('所有映射值为有效的 ActionType', () => {
    const validActions: ActionType[] = ['left', 'right', 'down', 'rotate', 'space', 'r', 'p', 's'];
    Object.values(keyboardMap).forEach((action) => {
      expect(validActions).toContain(action);
    });
  });
});

describe('validKeys', () => {
  it('包含所有已映射的键', () => {
    Object.keys(keyboardMap).forEach((key) => {
      expect(validKeys.has(key)).toBe(true);
    });
  });

  it('不包含未映射的键', () => {
    expect(validKeys.has('Enter')).toBe(false);
    expect(validKeys.has('a')).toBe(false);
    expect(validKeys.has('Escape')).toBe(false);
  });

  it('是 Set 实例', () => {
    expect(validKeys).toBeInstanceOf(Set);
  });
});

describe('getAction', () => {
  it('返回已映射按键的动作', () => {
    expect(getAction('ArrowLeft')).toBe('left');
    expect(getAction('ArrowUp')).toBe('rotate');
    expect(getAction(' ')).toBe('space');
  });

  it('未映射按键返回 undefined', () => {
    expect(getAction('Enter')).toBeUndefined();
    expect(getAction('a')).toBeUndefined();
    expect(getAction('')).toBeUndefined();
  });

  it('大小写敏感 (除已映射的 s/r/p)', () => {
    expect(getAction('s')).toBe('s');
    expect(getAction('S')).toBe('s');
    // 其他字母未映射
    expect(getAction('a')).toBeUndefined();
    expect(getAction('A')).toBeUndefined();
  });
});
