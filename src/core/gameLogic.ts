import type { BlockData, BlockType, MatrixData } from './types';
import { BLOCK_TYPES } from './types';
import { blockShape, blankLine, MATRIX_COLS, MATRIX_ROWS } from './constants';

/** 随机获取下一个方块类型 */
export function getNextType(): BlockType {
  return BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
}

/** 碰撞检测: 方块是否能移动到指定位置 */
export function want(next: BlockData, matrix: MatrixData): boolean {
  const [row, col] = next.xy;
  const shape = next.shape;
  const horizontal = shape[0].length;

  for (let k1 = 0; k1 < shape.length; k1++) {
    for (let k2 = 0; k2 < shape[k1].length; k2++) {
      if (col < 0) return false; // 左边界
      if (col + horizontal > MATRIX_COLS) return false; // 右边界
      if (row + k1 < 0) continue; // 顶部允许超出
      if (row + k1 >= MATRIX_ROWS) return false; // 底边界
      if (shape[k1][k2]) {
        if (matrix[row + k1][col + k2]) return false; // 与已有方块碰撞
      }
    }
  }
  return true;
}

/** 检测可消除的行, 返回行号数组或 null */
export function isClear(matrix: MatrixData): number[] | null {
  const clearLines: number[] = [];
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].every((n) => !!n)) {
      clearLines.push(i);
    }
  }
  return clearLines.length === 0 ? null : clearLines;
}

/** 检测游戏是否结束: 第一行有方块 */
export function isOver(matrix: MatrixData): boolean {
  return matrix[0].some((n) => !!n);
}

/** 将方块写入矩阵, 返回新矩阵 */
export function mergeBlock(matrix: MatrixData, block: BlockData): MatrixData {
  const result = matrix.map((row) => [...row]);
  const shape = block.shape;
  const [row, col] = block.xy;

  for (let k1 = 0; k1 < shape.length; k1++) {
    for (let k2 = 0; k2 < shape[k1].length; k2++) {
      if (shape[k1][k2] && row + k1 >= 0) {
        result[row + k1][col + k2] = 1;
      }
    }
  }
  return result;
}

/** 生成起始干扰行 */
export function getStartMatrix(startLines: number): MatrixData {
  const getLine = (min: number, max: number): number[] => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const line: number[] = [];
    for (let i = 0; i < count; i++) line.push(1);
    for (let i = 0, len = MATRIX_COLS - count; i < len; i++) {
      const index = Math.floor(Math.random() * (line.length + 1));
      line.splice(index, 0, 0);
    }
    return line;
  };

  const matrix: MatrixData = [];
  for (let i = 0; i < startLines; i++) {
    if (i <= 2) {
      matrix.push(getLine(5, 8));
    } else if (i <= 6) {
      matrix.push(getLine(4, 9));
    } else {
      matrix.push(getLine(3, 9));
    }
  }
  for (let i = 0, len = MATRIX_ROWS - startLines; i < len; i++) {
    matrix.unshift([...blankLine]);
  }
  return matrix;
}

/** 消除指定行, 返回新矩阵 */
export function clearMatrixLines(matrix: MatrixData, lines: number[]): MatrixData {
  const result = matrix.map((row) => [...row]);
  // 从小到大处理: 每次删除一行并在顶部插入空行,
  // 后续行号因 unshift 整体下移, 但因为先删了更小的行号, 后面的行号不受影响
  const sorted = [...lines].sort((a, b) => a - b);
  for (const line of sorted) {
    result.splice(line, 1);
    result.unshift([...blankLine]);
  }
  return result;
}

/** 获取方块在矩阵中的显示矩阵 (合并当前方块到矩阵, 用于渲染) */
export function getDisplayMatrix(matrix: MatrixData, cur: BlockData | null): MatrixData {
  if (!cur) return matrix;
  const result = matrix.map((row) => [...row]);
  const shape = cur.shape;
  const [row, col] = cur.xy;

  for (let k1 = 0; k1 < shape.length; k1++) {
    for (let k2 = 0; k2 < shape[k1].length; k2++) {
      if (shape[k1][k2] && row + k1 >= 0) {
        const r = row + k1;
        const c = col + k2;
        if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
          if (result[r][c] === 1) {
            result[r][c] = 2; // 重合
          } else {
            result[r][c] = 1; // 当前方块
          }
        }
      }
    }
  }
  return result;
}
