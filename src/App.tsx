import { memo, useEffect, useCallback, useRef, useState } from 'react';
import cn from 'classnames';
import { useGameStore } from './store/gameStore';
import { getGameController } from './core/GameController';
import { useResize } from './hooks/useResize';
import { useVisibility } from './hooks/useVisibility';
import { GameCanvas } from './components/GameCanvas';
import { NextCanvas } from './components/NextCanvas';
import { Decorate } from './components/Decorate';
import { Logo } from './components/Logo';
import { Point, Number as LedNumber } from './components/Point';
import { Keyboard } from './components/Keyboard';
import { Guide } from './components/Guide';
import { MusicToggle, PauseToggle } from './components/Controls';
import { useI18n } from './i18n';
import styles from './styles/App.module.css';

/** LED 时钟组件 (右下角显示当前时间) */
const LedTime = memo(function LedTime() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  return <LedNumber num={parseInt(h + m)} length={5} time />;
});

function AppInner() {
  const { t } = useI18n();
  const { css, filling } = useResize();
  const cur = useGameStore((s) => s.cur);
  const drop = useGameStore((s) => s.drop);
  const clearLines = useGameStore((s) => s.clearLines);
  const startLines = useGameStore((s) => s.startLines);
  const speedStart = useGameStore((s) => s.speedStart);
  const speedRun = useGameStore((s) => s.speedRun);
  const setFocus = useGameStore((s) => s.setFocus);

  const controllerRef = useRef(getGameController());

  const onHidden = useCallback(() => {
    setFocus(false);
    controllerRef.current.focus(false);
  }, [setFocus]);

  const onVisible = useCallback(() => {
    setFocus(true);
    controllerRef.current.focus(true);
  }, [setFocus]);

  useVisibility(onHidden, onVisible);

  // 初始加载: 如果没有当前游戏, 触发结束动画 (从下往上填满再清除)
  useEffect(() => {
    const state = useGameStore.getState();
    if (!state.cur) {
      controllerRef.current.overStart();
    }
  }, []);

  const isPlaying = !!cur;

  return (
    <div className={styles.app} style={css}>
      <div className={cn({ [styles.rect]: true, [styles.drop]: drop })}>
        <Decorate />
        <div className={styles.screen}>
          <div className={styles.panel}>
            <GameCanvas />
            <Logo />
            <div className={styles.state}>
              <Point />
              <p>{isPlaying ? t('cleans') : t('startLine')}</p>
              <LedNumber num={isPlaying ? clearLines : startLines} length={3} />
              <p>{t('level')}</p>
              <LedNumber num={isPlaying ? speedRun : speedStart} length={1} />
              <p>{t('next')}</p>
              <NextCanvas />
              <div className={styles.bottom}>
                <MusicToggle />
                <PauseToggle />
                <LedTime />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Keyboard filling={filling} />
      <Guide />
    </div>
  );
}

export const App = memo(AppInner);
