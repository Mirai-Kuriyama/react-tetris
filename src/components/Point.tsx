import { memo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useI18n } from '../i18n';
import styles from './Point.module.css';

/** LED 风格数字组件 (使用精灵图) */
function NumberInner({ num, length = 6, time = false }: { num?: number; length?: number; time?: boolean }) {
  let digits: string[];
  if (time) {
    // 时间格式: HH:MM -> [H, H, 'd', M, M]
    const str = String(num || 0).padStart(4, '0');
    digits = [str[0], str[1], 'd', str[2], str[3]];
  } else {
    const str = String(num ?? 0).split('');
    while (str.length < length) {
      str.unshift('n');
    }
    digits = str;
  }

  const posMap: Record<string, string> = {
    '0': styles.s0, '1': styles.s1, '2': styles.s2, '3': styles.s3,
    '4': styles.s4, '5': styles.s5, '6': styles.s6, '7': styles.s7,
    '8': styles.s8, '9': styles.s9, 'n': styles.sn,
    'd': styles.sd, 'd_c': styles.sdc,
  };

  return (
    <div className={styles.number}>
      {digits.map((d, i) => (
        <span key={i} className={`bg ${posMap[d] || styles.sn}`} />
      ))}
    </div>
  );
}

export const Number = memo(NumberInner);

/** 分数显示面板 - 匹配原版 point 组件行为 */
function PointInner() {
  const { t } = useI18n();
  const points = useGameStore((s) => s.points);
  const max = useGameStore((s) => s.max);
  const cur = useGameStore((s) => s.cur);

  // 游戏中显示得分, 未开始时显示最高分
  const label = cur ? t('point') : t('highestScore');
  const value = cur ? points : max;

  return (
    <div>
      <p className={styles.label}>{label}</p>
      <Number num={value} length={6} />
    </div>
  );
}

export const Point = memo(PointInner);
