import { memo, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { getGameController } from '../core/GameController';
import { MatrixRenderer } from '../engine/MatrixRenderer';
import { getDisplayMatrix } from '../core/gameLogic';
import { MATRIX_ROWS, fillLine, blankLine } from '../core/constants';
import type { MatrixData } from '../core/types';

/** 游戏矩阵 Canvas 组件 */
function GameCanvasInner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MatrixRenderer | null>(null);
  const animatingRef = useRef(false);
  const matrix = useGameStore((s) => s.matrix);
  const cur = useGameStore((s) => s.cur);
  const clearingLines = useGameStore((s) => s.clearingLines);
  const reset = useGameStore((s) => s.reset);

  const getRenderer = useCallback(() => {
    if (!canvasRef.current) return null;
    // StrictMode 会重新创建 canvas DOM 元素, 需要检测并重建 renderer
    if (!rendererRef.current || rendererRef.current.canvas !== canvasRef.current) {
      rendererRef.current = new MatrixRenderer(canvasRef.current);
    }
    return rendererRef.current;
  }, []);

  // 正常渲染 (reset/动画时跳过, 由 over 动画接管)
  useEffect(() => {
    if (reset || animatingRef.current) return;
    const renderer = getRenderer();
    if (!renderer) return;
    renderer.render(matrix, cur);
  }, [matrix, cur, reset, getRenderer]);

  // 消除动画
  useEffect(() => {
    if (clearingLines.length === 0) return;
    if (reset) return;
    const renderer = getRenderer();
    if (!renderer) return;

    let count = 0;
    const timer = setInterval(() => {
      count++;
      renderer.renderClearAnimation(matrix, clearingLines, count);
      if (count >= 10) {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [clearingLines, matrix, reset, getRenderer]);

  // 游戏结束动画: 从下往上填满, 再从上往下清除
  useEffect(() => {
    if (!reset) return;
    const renderer = getRenderer();
    if (!renderer) return;

    animatingRef.current = true;

    // 取当前矩阵快照 (含当前方块)
    const snapshot = getDisplayMatrix(matrix, cur);
    const overState: MatrixData = snapshot.map((row) => [...row]);

    const FRAME_MS = 40;
    const totalFrames = MATRIX_ROWS * 2; // 20 填充 + 20 清除
    const startTime = performance.now();
    let frame = 0;
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const targetFrame = Math.min(Math.floor(elapsed / FRAME_MS), totalFrames);

      // 推进到目标帧
      while (frame < targetFrame) {
        if (frame < MATRIX_ROWS) {
          // 阶段1: 从下往上填满
          overState[MATRIX_ROWS - 1 - frame] = [...fillLine];
        } else {
          // 阶段2: 从上往下清除
          overState[frame - MATRIX_ROWS] = [...blankLine];
        }
        frame++;
      }

      renderer.renderOverAnimation(overState);

      if (frame >= totalFrames && elapsed >= totalFrames * FRAME_MS) {
        animatingRef.current = false;
        getGameController().overEnd();
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      animatingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
      }}
    />
  );
}

export const GameCanvas = memo(GameCanvasInner);
