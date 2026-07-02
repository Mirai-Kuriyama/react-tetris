import type { BlockType } from '../core/types';
import { blockShape, nextXY, nextEmpty, CELL_SIZE, COLORS } from '../core/constants';

/**
 * 下一方块预览 Canvas 渲染器
 * 绘制 4x2 网格中的方块预览
 * 格子样式与 MatrixRenderer 一致: 2px border + 2px padding(背景色) + 12px inner
 */
export class NextRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private cellSize: number;
  private cssW: number;
  private cssH: number;

  constructor(canvas: HTMLCanvasElement, cellSize = 22) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    this.cellSize = cellSize;
    this.cssW = 4 * cellSize; // 88px
    this.cssH = 2 * cellSize; // 44px
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.canvas.width = this.cssW * this.dpr;
    this.canvas.height = this.cssH * this.dpr;
    this.canvas.style.width = `${this.cssW}px`;
    this.canvas.style.height = `${this.cssH}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * 绘制单个方块格
   * 与 MatrixRenderer 相同的结构: border + padding(panelBg) + inner
   */
  private drawCell(row: number, col: number, value: number): void {
    const x = col * this.cellSize;
    const y = row * this.cellSize;
    const size = this.cellSize - 2; // 20px
    const border = 2;
    const innerSize = size - border * 2 - 4; // 12px

    let borderColor: string = COLORS.border;
    let innerColor: string = COLORS.empty;

    if (value === 1) {
      borderColor = COLORS.borderActive;
      innerColor = COLORS.filled;
    }

    // 1. 边框
    this.ctx.fillStyle = borderColor;
    this.ctx.fillRect(x, y, size, size);

    // 2. 内边距 (面板背景色)
    this.ctx.fillStyle = COLORS.panelBg;
    this.ctx.fillRect(x + border, y + border, size - border * 2, size - border * 2);

    // 3. 内核
    this.ctx.fillStyle = innerColor;
    this.ctx.fillRect(x + border + 2, y + border + 2, innerSize, innerSize);
  }

  render(type: BlockType | null): void {
    this.ctx.clearRect(0, 0, this.cssW, this.cssH);
    // 填充面板背景色
    this.ctx.fillStyle = COLORS.panelBg;
    this.ctx.fillRect(0, 0, this.cssW, this.cssH);

    const grid = nextEmpty.map((row) => [...row]);

    if (type) {
      const shape = blockShape[type];
      const [offsetRow, offsetCol] = nextXY[type];

      for (let k1 = 0; k1 < shape.length; k1++) {
        for (let k2 = 0; k2 < shape[k1].length; k2++) {
          if (shape[k1][k2]) {
            const r = k1 + offsetRow;
            const c = k2 + offsetCol;
            if (r >= 0 && r < 2 && c >= 0 && c < 4) {
              grid[r][c] = 1;
            }
          }
        }
      }
    }

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        this.drawCell(r, c, grid[r][c]);
      }
    }
  }

  resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.setupCanvas();
  }
}
