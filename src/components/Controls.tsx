import { memo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useI18n } from '../i18n';
import styles from './Controls.module.css';

/** 音乐开关 - 精灵图图标 */
function MusicToggleInner() {
  const music = useGameStore((s) => s.music);
  const setMusic = useGameStore((s) => s.setMusic);
  const lock = useGameStore((s) => s.lock);

  return (
    <div
      className={`bg ${styles.music} ${music ? styles.c : ''}`}
      onClick={() => { if (!lock) setMusic(!music); }}
    />
  );
}

export const MusicToggle = memo(MusicToggleInner);

/** 暂停开关 - 精灵图图标 */
function PauseToggleInner() {
  const pause = useGameStore((s) => s.pause);
  const setPause = useGameStore((s) => s.setPause);
  const lock = useGameStore((s) => s.lock);
  const cur = useGameStore((s) => s.cur);
  const focus = useGameStore((s) => s.focus);

  return (
    <div
      className={`bg ${styles.pause} ${pause ? styles.c : ''}`}
      onClick={() => {
        if (lock || !cur || !focus) return;
        setPause(!pause);
      }}
    />
  );
}

export const PauseToggle = memo(PauseToggleInner);
