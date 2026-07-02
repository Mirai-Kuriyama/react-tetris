import { describe, it, expect } from 'vitest';
import {
  getNextType,
  want,
  isClear,
  isOver,
  mergeBlock,
  clearMatrixLines,
  getDisplayMatrix,
  getStartMatrix,
} from './gameLogic';
import { Block } from './Block';
import { BLOCK_TYPES } from './types';
import { blankMatrix, blankLine, fillLine, MATRIX_ROWS, MATRIX_COLS } from './constants';
import type { MatrixData, BlockData } from './types';

/** 创建空矩阵 */
function emptyMatrix(): MatrixData {
  return blankMatrix.map((row) => [...row]);
}

/** 在指定行填充一行 (用于测试消除) */
function fillRow(matrix: MatrixData, row: number): MatrixData {
  const result = matrix.map((r) => [...r]);
  result[row] = [...fillLine];
  return result;
}

describe('getNextType', () => {
  it('应返回有效的方块类型', () => {
    const type = getNextType();
    expect(BLOCK_TYPES).toContain(type);
  });

  it('多次调用应返回不同类型 (概率验证)', () => {
    const types = new Set<string>();
    for (let i = 0; i < 100; i++) {
      types.add(getNextType());
    }
    expect(types.size).toBeGreaterThan(1);
  });
});

describe('want', () => {
  it('空矩阵中方块应可移动', () => {
    const block = new Block({ type: 'I' });
    const matrix = emptyMatrix();
    expect(want(block, matrix)).toBe(true);
  });

  it('左边界检测', () => {
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [0, -1],
      rotateIndex: 0,
      timeStamp: 0,
    };
    expect(want(block, emptyMatrix())).toBe(false);
  });

  it('右边界检测', () => {
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [0, MATRIX_COLS - 1],
      rotateIndex: 0,
      timeStamp: 0,
    };
    expect(want(block, emptyMatrix())).toBe(false);
  });

  it('底边界检测', () => {
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [MATRIX_ROWS - 1, 0],
      rotateIndex: 0,
      timeStamp: 0,
    };
    // 方块高度2, 放在最后一行会超出
    expect(want(block, emptyMatrix())).toBe(false);
  });

  it('顶部允许超出 (负行号)', () => {
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [-1, 0],
      rotateIndex: 0,
      timeStamp: 0,
    };
    expect(want(block, emptyMatrix())).toBe(true);
  });

  it('与已有方块碰撞检测', () => {
    const matrix = emptyMatrix();
    matrix[5][3] = 1;
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [4, 3],
      rotateIndex: 0,
      timeStamp: 0,
    };
    // 方块在 (4,3) 和 (5,3), (5,3) 已有方块
    expect(want(block, matrix)).toBe(false);
  });

  it('空形状不碰撞', () => {
    const block: BlockData = {
      type: 'I',
      shape: [[0, 0, 0, 0]],
      xy: [0, 0],
      rotateIndex: 0,
      timeStamp: 0,
    };
    expect(want(block, emptyMatrix())).toBe(true);
  });
});

describe('isClear', () => {
  it('空矩阵无消除', () => {
    expect(isClear(emptyMatrix())).toBeNull();
  });

  it('单行满消检测', () => {
    const matrix = fillRow(emptyMatrix(), 19);
    const result = isClear(matrix);
    expect(result).toEqual([19]);
  });

  it('多行满消检测', () => {
    let matrix = fillRow(emptyMatrix(), 18);
    matrix = fillRow(matrix, 19);
    const result = isClear(matrix);
    expect(result).toEqual([18, 19]);
  });

  it('部分填充不算消除', () => {
    const matrix = emptyMatrix();
    matrix[19] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]; // 缺一个
    expect(isClear(matrix)).toBeNull();
  });
});

describe('isOver', () => {
  it('空矩阵未结束', () => {
    expect(isOver(emptyMatrix())).toBe(false);
  });

  it('第一行有方块则结束', () => {
    const matrix = emptyMatrix();
    matrix[0][5] = 1;
    expect(isOver(matrix)).toBe(true);
  });

  it('第一行无方块但其他行有方块未结束', () => {
    const matrix = emptyMatrix();
    matrix[5][5] = 1;
    expect(isOver(matrix)).toBe(false);
  });
});

describe('mergeBlock', () => {
  it('方块合并到空矩阵', () => {
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [18, 4],
      rotateIndex: 0,
      timeStamp: 0,
    };
    const result = mergeBlock(emptyMatrix(), block);
    expect(result[18][4]).toBe(1);
    expect(result[18][5]).toBe(1);
    expect(result[19][4]).toBe(1);
    expect(result[19][5]).toBe(1);
  });

  it('不修改原矩阵', () => {
    const original = emptyMatrix();
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [0, 0],
      rotateIndex: 0,
      timeStamp: 0,
    };
    mergeBlock(original, block);
    expect(original[0][0]).toBe(0);
  });

  it('负行号的方块部分不合并', () => {
    const block: BlockData = {
      type: 'L',
      shape: [[0, 0, 1], [1, 1, 1]],
      xy: [-1, 3],
      rotateIndex: 0,
      timeStamp: 0,
    };
    const result = mergeBlock(emptyMatrix(), block);
    // 第一行 (xy[0]=-1) 不合并, 第二行 (xy[0]+1=0) 合并
    expect(result[0][3]).toBe(1);
    expect(result[0][4]).toBe(1);
    expect(result[0][5]).toBe(1);
  });
});

describe('clearMatrixLines', () => {
  it('清除单行', () => {
    let matrix = fillRow(emptyMatrix(), 19);
    const result = clearMatrixLines(matrix, [19]);
    // 最后一行被清除, 顶部添加空行
    expect(result[19]).toEqual([...blankLine]);
    expect(result[0]).toEqual([...blankLine]);
  });

  it('清除多行', () => {
    let matrix = fillRow(emptyMatrix(), 18);
    matrix = fillRow(matrix, 19);
    const result = clearMatrixLines(matrix, [18, 19]);
    expect(result[18]).toEqual([...blankLine]);
    expect(result[19]).toEqual([...blankLine]);
    expect(result[0]).toEqual([...blankLine]);
    expect(result[1]).toEqual([...blankLine]);
  });

  it('不修改原矩阵', () => {
    const matrix = fillRow(emptyMatrix(), 19);
    clearMatrixLines(matrix, [19]);
    expect(matrix[19]).toEqual([...fillLine]);
  });

  it('保持总行数不变', () => {
    const matrix = fillRow(emptyMatrix(), 10);
    const result = clearMatrixLines(matrix, [10]);
    expect(result.length).toBe(MATRIX_ROWS);
  });
});

describe('getDisplayMatrix', () => {
  it('cur 为 null 时返回原矩阵', () => {
    const matrix = emptyMatrix();
    expect(getDisplayMatrix(matrix, null)).toBe(matrix);
  });

  it('合并当前方块到显示矩阵', () => {
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [0, 0],
      rotateIndex: 0,
      timeStamp: 0,
    };
    const result = getDisplayMatrix(emptyMatrix(), block);
    expect(result[0][0]).toBe(1);
    expect(result[0][1]).toBe(1);
    expect(result[1][0]).toBe(1);
    expect(result[1][1]).toBe(1);
  });

  it('与已有方块重合标记为 2', () => {
    const matrix = emptyMatrix();
    matrix[0][0] = 1;
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [0, 0],
      rotateIndex: 0,
      timeStamp: 0,
    };
    const result = getDisplayMatrix(matrix, block);
    expect(result[0][0]).toBe(2); // 重合
    expect(result[0][1]).toBe(1); // 当前方块
  });

  it('不修改原矩阵', () => {
    const matrix = emptyMatrix();
    const block: BlockData = {
      type: 'O',
      shape: [[1, 1], [1, 1]],
      xy: [0, 0],
      rotateIndex: 0,
      timeStamp: 0,
    };
    getDisplayMatrix(matrix, block);
    expect(matrix[0][0]).toBe(0);
  });
});

describe('getStartMatrix', () => {
  it('0 行起始矩阵为空', () => {
    const result = getStartMatrix(0);
    expect(result.length).toBe(MATRIX_ROWS);
    result.forEach((row) => {
      expect(row.every((c) => c === 0)).toBe(true);
    });
  });

  it('指定行数的起始矩阵', () => {
    const lines = 5;
    const result = getStartMatrix(lines);
    expect(result.length).toBe(MATRIX_ROWS);
    // 底部 lines 行应有部分填充
    let hasBlock = false;
    for (let i = MATRIX_ROWS - lines; i < MATRIX_ROWS; i++) {
      if (result[i].some((c) => c === 1)) {
        hasBlock = true;
      }
    }
    expect(hasBlock).toBe(true);
    // 顶部应有空行
    for (let i = 0; i < MATRIX_ROWS - lines; i++) {
      expect(result[i].every((c) => c === 0)).toBe(true);
    }
  });

  it('起始行不应该是满行', () => {
    const result = getStartMatrix(10);
    result.forEach((row) => {
      // 每行至少有一个空位
      expect(row.some((c) => c === 0)).toBe(true);
    });
  });
});
