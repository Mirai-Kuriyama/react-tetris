import type { CSSProperties } from 'react';
import { useState, useEffect, useCallback } from 'react';

/** 响应式缩放 Hook: 根据窗口尺寸计算缩放比例 */
export function useResize() {
  const [size, setSize] = useState(() => {
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    return { w, h };
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
      });
    };
    window.addEventListener('resize', onResize, true);
    return () => window.removeEventListener('resize', onResize, true);
  }, []);

  const getScaleStyle = useCallback((): { css: CSSProperties; filling: number } => {
    let filling = 0;
    const { w, h } = size;
    const ratio = h / w;
    let scale: number;
    let css: CSSProperties = {};

    if (ratio < 1.5) {
      scale = h / 960;
    } else {
      scale = w / 640;
      filling = (h - 960 * scale) / scale / 3;
      css = {
        paddingTop: Math.floor(filling) + 42,
        paddingBottom: Math.floor(filling),
        marginTop: Math.floor(-480 - filling * 1.5),
      };
    }
    (css as any).transform = `scale(${scale})`;
    return { css, filling };
  }, [size]);

  const { css, filling } = getScaleStyle();
  return { css, filling, size, getScaleStyle };
}
