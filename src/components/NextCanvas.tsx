import { memo, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { NextRenderer } from '../engine/NextRenderer';

function NextCanvasInner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<NextRenderer | null>(null);
  const next = useGameStore((s) => s.next);

  useEffect(() => {
    if (!canvasRef.current) return;
    // StrictMode 会重新创建 canvas DOM 元素, 需要检测并重建 renderer
    if (!rendererRef.current || rendererRef.current.canvas !== canvasRef.current) {
      rendererRef.current = new NextRenderer(canvasRef.current);
    }
    rendererRef.current.render(next);
  }, [next]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', float: 'right' }}
    />
  );
}

export const NextCanvas = memo(NextCanvasInner);
