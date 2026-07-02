import { memo, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';
import { useGameStore } from '../store/gameStore';
import { bindButtonEvent } from '../input/InputManager';
import type { ActionType } from '../core/types';
import styles from './Keyboard.module.css';

type Color = 'blue' | 'green' | 'red';
type Size = 's0' | 's1' | 's2';

interface BtnProps {
  action: ActionType;
  color: Color;
  size: Size;
  top: number;
  left: number;
  label: string;
  arrow?: string;
  position?: boolean;
  active: boolean;
}

function Btn({ action, color, size, top, left, label, arrow, position, active }: BtnProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return bindButtonEvent(el, action);
  }, [action]);

  return (
    <div
      ref={ref}
      className={`${styles.button} ${styles[color]} ${styles[size]}`}
      style={{ top, left }}
    >
      <i className={active ? styles.active : ''} />
      {size === 's1' && arrow && (
        <em style={{ transform: `${arrow} scale(1,2)` }} />
      )}
      <span className={position ? styles.position : ''}>{label}</span>
    </div>
  );
}

function KeyboardInner({ filling = 0 }: { filling?: number }) {
  const { t } = useI18n();
  const keyboard = useGameStore((s) => s.keyboard);

  return (
    <div className={styles.keyboard} style={{ marginTop: 20 + filling }}>
      <Btn action="rotate" color="blue" size="s1" top={0} left={374}
        label={t('rotation')} arrow="translate(0, 63px)" position active={keyboard.rotate} />
      <Btn action="down" color="blue" size="s1" top={180} left={374}
        label={t('down')} arrow="translate(0,-71px) rotate(180deg)" active={keyboard.down} />
      <Btn action="left" color="blue" size="s1" top={90} left={284}
        label={t('left')} arrow="translate(60px, -12px) rotate(270deg)" active={keyboard.left} />
      <Btn action="right" color="blue" size="s1" top={90} left={464}
        label={t('right')} arrow="translate(-60px, -12px) rotate(90deg)" active={keyboard.right} />
      <Btn action="space" color="blue" size="s0" top={100} left={52}
        label={`${t('drop')} (SPACE)`} active={keyboard.drop} />
      <Btn action="r" color="red" size="s2" top={0} left={196}
        label={`${t('reset')}(R)`} active={keyboard.reset} />
      <Btn action="s" color="green" size="s2" top={0} left={106}
        label={`${t('sound')}(S)`} active={keyboard.music} />
      <Btn action="p" color="green" size="s2" top={0} left={16}
        label={`${t('pause')}(P)`} active={keyboard.pause} />
    </div>
  );
}

export const Keyboard = memo(KeyboardInner);
