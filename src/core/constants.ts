import type { BlockType, Shape, MatrixData } from './types';

/** 方块形状定义 */
export const blockShape: Record<BlockType, Shape> = {
  I: [[1, 1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
};

/** 旋转偏移 (每个方块类型不同旋转阶段的 xy 偏移) */
export const origin: Record<BlockType, [number, number][]> = {
  I: [[-1, 1], [1, -1]],
  L: [[0, 0]],
  J: [[0, 0]],
  Z: [[0, 0]],
  S: [[0, 0]],
  O: [[0, 0]],
  T: [[0, 0], [1, 0], [-1, 1], [0, -1]],
};

/** 下落速度 (毫秒), 索引 0-5 对应速度 1-6 */
export const speeds = [800, 650, 500, 370, 250, 160];

/** 移动延迟 (毫秒), 用于左右移动时调整下落计时 */
export const delays = [50, 60, 70, 80, 90, 100];

/** 满行 */
export const fillLine = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

/** 空行 */
export const blankLine = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

/** 空矩阵 (20行x10列) */
export const blankMatrix: MatrixData = Array.from({ length: 20 }, () => [...blankLine]);

/** 消除行得分 (1/2/3/4 行分别对应) */
export const clearPoints = [100, 300, 700, 1500];

/** localStorage 存储 key */
export const StorageKey = 'REACT_TETRIS';

/** 最大分数 */
export const maxPoint = 999999;

/** 每消除 N 行增加速度 */
export const eachLines = 20;

/** 矩阵行数 */
export const MATRIX_ROWS = 20;

/** 矩阵列数 */
export const MATRIX_COLS = 10;

/** 方块大小 (像素) */
export const CELL_SIZE = 22;

/** 方块边框 (像素) */
export const CELL_BORDER = 2;

/** 方块内边距 (像素) */
export const CELL_PADDING = 2;

/** 方块颜色 */
export const COLORS = {
  empty: '#879372',
  filled: '#000000',
  overlap: '#560000',
  border: '#879372',
  borderActive: '#000000',
  borderOverlap: '#560000',
  panelBg: '#9ead86',
} as const;

/** 下一方块预览中方块类型的起始坐标 */
export const nextXY: Record<BlockType, [number, number]> = {
  I: [1, 0],
  L: [0, 0],
  J: [0, 0],
  Z: [0, 0],
  S: [0, 0],
  O: [0, 1],
  T: [0, 0],
};

/** 下一方块预览空网格 */
export const nextEmpty: number[][] = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
