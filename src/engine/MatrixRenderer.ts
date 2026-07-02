import type { BlockData, MatrixData } from '../core/types';
import { MATRIX_COLS, MATRIX_ROWS, CELL_SIZE, COLORS } from '../core/constants';
import { getDisplayMatrix } from '../core/gameLogic';

/**
 * 游戏矩阵 Canvas 渲染器
 * 负责绘制 20x10 的游戏矩阵, 包括消除闪烁和游戏结束动画
 * 原版使用 DOM b 元素: 2px border + 2px padding(透明) + 12px inner
 */
export class MatrixRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private cellSize: number;
  private cssW: number;
  private cssH: number;

  constructor(canvas: HTMLCanvasElement, cellSize = CELL_SIZE) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    this.cellSize = cellSize;
    // 画布尺寸: 2px border + 3px left/top padding + content + 1px right/bottom padding + 2px border
    this.cssW = MATRIX_COLS * cellSize + 8; // 2+3+220+1+2 = 228
    this.cssH = MATRIX_ROWS * cellSize + 8; // 2+3+440+1+2 = 448
    this.setupCanvas();
  }

  /** 设置 Canvas 尺寸 (DPR 适配) */
  private setupCanvas(): void {
    this.canvas.width = this.cssW * this.dpr;
    this.canvas.height = this.cssH * this.dpr;
    this.canvas.style.width = `${this.cssW}px`;
    this.canvas.style.height = `${this.cssH}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  /** 绘制矩阵背景: 面板色填充 + 2px 黑色边框 */
  private drawBackground(): void {
    this.ctx.fillStyle = COLORS.panelBg;
    this.ctx.fillRect(0, 0, this.cssW, this.cssH);
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.cssW, 2); // top
    this.ctx.fillRect(0, this.cssH - 2, this.cssW, 2); // bottom
    this.ctx.fillRect(0, 0, 2, this.cssH); // left
    this.ctx.fillRect(this.cssW - 2, 0, 2, this.cssH); // right
  }

  /**
   * 绘制单个方块格
   * 原版 DOM 结构: 20px cell = 2px border + 2px padding(背景色) + 12px inner
   */
  private drawCell(row: number, col: number, value: number): void {
    const x = col * this.cellSize + 5; // 2px border + 3px left padding
    const y = row * this.cellSize + 5; // 2px border + 3px top padding
    const size = this.cellSize - 2; // 20px (不含 margin)
    const border = 2;
    const innerSize = size - border * 2 - 4; // 12px inner

    let borderColor: string = COLORS.border;
    let innerColor: string = COLORS.empty;

    if (value === 1) {
      borderColor = COLORS.borderActive;
      innerColor = COLORS.filled;
    } else if (value === 2) {
      borderColor = COLORS.borderOverlap;
      innerColor = COLORS.overlap;
    }

    // 1. 填充边框 (20x20)
    this.ctx.fillStyle = borderColor;
    this.ctx.fillRect(x, y, size, size);

    // 2. 填充内边距 (16x16) - 使用面板背景色, 产生边框与内核之间的间隙
    this.ctx.fillStyle = COLORS.panelBg;
    this.ctx.fillRect(x + border, y + border, size - border * 2, size - border * 2);

    // 3. 填充内核 (12x12)
    this.ctx.fillStyle = innerColor;
    this.ctx.fillRect(x + border + 2, y + border + 2, innerSize, innerSize);
  }

  /** 渲染矩阵 (含当前方块) */
  render(matrix: MatrixData, cur: BlockData | null): void {
    const display = getDisplayMatrix(matrix, cur);
    this.ctx.clearRect(0, 0, this.cssW, this.cssH);
    this.drawBackground();
    for (let r = 0; r < MATRIX_ROWS; r++) {
      for (let c = 0; c < MATRIX_COLS; c++) {
        this.drawCell(r, c, display[r][c]);
      }
    }
  }

  /** 渲染消除闪烁动画 */
  renderClearAnimation(matrix: MatrixData, clearLines: number[], animateColor: number): void {
    this.ctx.clearRect(0, 0, this.cssW, this.cssH);
    this.drawBackground();
    for (let r = 0; r < MATRIX_ROWS; r++) {
      const isClearing = clearLines.includes(r);
      for (let c = 0; c < MATRIX_COLS; c++) {
        if (isClearing) {
          this.drawCell(r, c, animateColor);
        } else {
          this.drawCell(r, c, matrix[r][c]);
        }
      }
    }
  }

  /** 渲染游戏结束动画 (逐行填充/清除) */
  renderOverAnimation(overState: MatrixData): void {
    this.ctx.clearRect(0, 0, this.cssW, this.cssH);
    this.drawBackground();
    for (let r = 0; r < MATRIX_ROWS; r++) {
      for (let c = 0; c < MATRIX_COLS; c++) {
        this.drawCell(r, c, overState[r][c]);
      }
    }
  }

  /** 重新设置 Canvas (窗口变化时) */
  resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.setupCanvas();
  }
}
