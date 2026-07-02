import { memo, useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useI18n } from '../i18n';
import styles from './Logo.module.css';

type Frame = 'r1' | 'r2' | 'r3' | 'r4' | 'l1' | 'l2' | 'l3' | 'l4';

function LogoInner() {
  const { t } = useI18n();
  const cur = useGameStore((s) => s.cur);
  const reset = useGameStore((s) => s.reset);

  const [frame, setFrame] = useState<Frame>('r1');
  const [display, setDisplay] = useState<'none' | 'block'>('none');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 清除所有定时器
  const clearAll = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const setT = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  useEffect(() => {
    clearAll();
    setFrame('r1');
    setDisplay('none');

    // 游戏进行中或重置中, 不显示
    if (cur || reset) {
      setDisplay('none');
      return;
    }

    let dir: 'r' | 'l' = 'r';
    let count = 0;

    const eyes = (fn: (() => void) | null, d1: number, d2: number) => {
      setT(() => {
        setFrame(`${dir}2` as Frame);
        setT(() => {
          setFrame(`${dir}1` as Frame);
          fn?.();
        }, d2);
      }, d1);
    };

    const run = (fn: () => void) => {
      setT(() => {
        setFrame(`${dir}4` as Frame);
        setT(() => {
          setFrame(`${dir}3` as Frame);
          count++;
          if (count === 10 || count === 20 || count === 30) {
            dir = dir === 'r' ? 'l' : 'r';
          }
          if (count < 40) {
            run(fn);
          } else {
            setFrame(`${dir}1` as Frame);
            setT(fn, 4000);
          }
        }, 100);
      }, 100);
    };

    const dra = () => {
      count = 0;
      eyes(() => eyes(() => eyes(() => {
        setFrame(`${dir}2` as Frame);
        run(dra);
      }, 150, 150), 150, 150), 1000, 1500);
    };

    const show = (fn: () => void) => {
      setT(() => { setDisplay('block'); fn(); }, 150);
    };
    const hide = (fn: () => void) => {
      setT(() => { setDisplay('none'); fn(); }, 150);
    };

    // 忽隐忽现 -> 开始运动
    show(() => hide(() => show(() => hide(() => show(dra)))));

    return clearAll;
  }, [cur, reset]);

  if (cur) return null;

  return (
    <div className={styles.logo} style={{ display }}>
      <div className={`bg ${styles.dragon} ${styles[frame]}`} />
      <p dangerouslySetInnerHTML={{ __html: t('titleCenter') }} />
    </div>
  );
}

export const Logo = memo(LogoInner);
