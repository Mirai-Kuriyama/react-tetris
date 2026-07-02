import { useEffect, useRef } from 'react';

/** 监听页面可见性变化，隐藏时自动暂停游戏 */
export function useVisibility(onHidden: () => void, onVisible: () => void) {
  const prevHiddenRef = useRef(true);

  useEffect(() => {
    let nextHidden = false;

    const handleBlur = () => {
      nextHidden = true;
    };

    const handleFocus = () => {
      nextHidden = false;
    };

    const handleVisibility = () => {
      nextHidden = document.hidden;
    };

    const tick = () => {
      if (prevHiddenRef.current !== nextHidden) {
        prevHiddenRef.current = nextHidden;
        if (nextHidden) {
          onHidden();
        } else {
          onVisible();
        }
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    const timer = setInterval(tick, 100);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(timer);
    };
  }, [onHidden, onVisible]);
}
