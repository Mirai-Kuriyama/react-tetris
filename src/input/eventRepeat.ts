/** 按键连发系统: 处理按键按住时的连续触发 */

interface RepeatOption {
  key: string;
  begin?: number;
  interval?: number;
  once?: boolean;
  callback?: (clear: () => void) => void;
}

const timers: Record<string, ReturnType<typeof setTimeout> | null> = {};

/** 清除所有定时器 */
function clearAllTimers(): void {
  for (const key of Object.keys(timers)) {
    if (timers[key]) {
      clearTimeout(timers[key]!);
      timers[key] = null;
    }
  }
}

/** 按键按下 */
export function down(option: RepeatOption): void {
  // 清除其他所有定时器
  clearAllTimers();

  if (!option.callback) return;

  const clear = () => {
    if (timers[option.key]) {
      clearTimeout(timers[option.key]!);
      timers[option.key] = null;
    }
  };

  option.callback(clear);

  if (option.once === true) return;

  let begin = option.begin ?? 100;
  const interval = option.interval ?? 50;

  const loop = () => {
    timers[option.key] = setTimeout(() => {
      begin = null as unknown as number; // 标记已过初始延迟
      loop();
      option.callback?.(clear);
    }, begin ?? interval);
  };
  loop();
}

/** 按键释放 */
export function up(option: { key: string; callback?: () => void }): void {
  if (timers[option.key]) {
    clearTimeout(timers[option.key]!);
    timers[option.key] = null;
  }
  option.callback?.();
}

/** 清除所有定时器 */
export function clearAll(): void {
  clearAllTimers();
}
