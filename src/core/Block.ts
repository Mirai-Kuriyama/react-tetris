import type { BlockData, BlockOption, BlockType, Shape, XY } from './types';
import { blockShape, origin } from './constants';

/**
 * 方块类: 管理 Tetris 方块的状态和操作
 * 每次操作 (rotate/fall/left/right) 返回新的 BlockData, 不修改自身
 */
export class Block implements BlockData {
  type: BlockType;
  shape: Shape;
  xy: XY;
  rotateIndex: number;
  timeStamp: number;

  constructor(option: BlockOption) {
    this.type = option.type;
    this.rotateIndex = option.rotateIndex ?? 0;
    this.timeStamp = option.timeStamp ?? Date.now();

    if (!option.shape) {
      // 初始化: 从 blockShape 获取形状
      this.shape = blockShape[option.type].map((row) => [...row]);
    } else {
      this.shape = option.shape.map((row) => [...row]);
    }

    if (!option.xy) {
      // 根据方块类型设置初始坐标
      switch (option.type) {
        case 'I':
          this.xy = [0, 3];
          break;
        case 'L':
        case 'J':
        case 'Z':
        case 'S':
        case 'O':
        case 'T':
          this.xy = [-1, 4];
          break;
        default:
          this.xy = [-1, 4];
      }
    } else {
      this.xy = [option.xy[0], option.xy[1]];
    }
  }

  /** 旋转: 矩阵转置 */
  rotate(): BlockData {
    const shape = this.shape;
    const rows = shape.length;
    const cols = shape[0].length;
    // 转置: newShape[col][row] = shape[row][col], 然后反转每行
    const result: Shape = Array.from({ length: cols }, () => new Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result[c][rows - 1 - r] = shape[r][c];
      }
    }

    const originData = origin[this.type][this.rotateIndex];
    const nextXy: XY = [
      this.xy[0] + originData[0],
      this.xy[1] + originData[1],
    ];
    const nextRotateIndex = this.rotateIndex + 1 >= origin[this.type].length
      ? 0
      : this.rotateIndex + 1;

    return {
      shape: result,
      type: this.type,
      xy: nextXy,
      rotateIndex: nextRotateIndex,
      timeStamp: this.timeStamp,
    };
  }

  /** 下落 n 格 */
  fall(n = 1): BlockData {
    return {
      shape: this.shape.map((row) => [...row]),
      type: this.type,
      xy: [this.xy[0] + n, this.xy[1]],
      rotateIndex: this.rotateIndex,
      timeStamp: Date.now(),
    };
  }

  /** 右移 */
  right(): BlockData {
    return {
      shape: this.shape.map((row) => [...row]),
      type: this.type,
      xy: [this.xy[0], this.xy[1] + 1],
      rotateIndex: this.rotateIndex,
      timeStamp: this.timeStamp,
    };
  }

  /** 左移 */
  left(): BlockData {
    return {
      shape: this.shape.map((row) => [...row]),
      type: this.type,
      xy: [this.xy[0], this.xy[1] - 1],
      rotateIndex: this.rotateIndex,
      timeStamp: this.timeStamp,
    };
  }
}

/** 从 BlockData 恢复 Block 实例 */
export function createBlock(data: BlockData): Block {
  return new Block({
    type: data.type,
    shape: data.shape,
    xy: data.xy,
    rotateIndex: data.rotateIndex,
    timeStamp: data.timeStamp,
  });
}
