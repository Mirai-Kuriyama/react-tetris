import { describe, it, expect } from 'vitest';
import { Block, createBlock } from './Block';
import { blockShape, origin } from './constants';
import type { BlockType } from './types';

describe('Block 构造函数', () => {
  it('I 方块默认坐标为 [0, 3]', () => {
    const block = new Block({ type: 'I' });
    expect(block.xy).toEqual([0, 3]);
    expect(block.shape).toEqual(blockShape.I);
    expect(block.rotateIndex).toBe(0);
  });

  it('非 I 方块默认坐标为 [-1, 4]', () => {
    const types: BlockType[] = ['L', 'J', 'Z', 'S', 'O', 'T'];
    for (const type of types) {
      const block = new Block({ type });
      expect(block.xy).toEqual([-1, 4]);
      expect(block.shape).toEqual(blockShape[type]);
    }
  });

  it('自定义 xy', () => {
    const block = new Block({ type: 'O', xy: [10, 5] });
    expect(block.xy).toEqual([10, 5]);
  });

  it('自定义 shape 不使用 blockShape', () => {
    const customShape = [[1, 0], [0, 1]];
    const block = new Block({ type: 'O', shape: customShape });
    expect(block.shape).toEqual(customShape);
    expect(block.shape).not.toBe(customShape); // 应是副本
  });

  it('自定义 rotateIndex', () => {
    const block = new Block({ type: 'T', rotateIndex: 2 });
    expect(block.rotateIndex).toBe(2);
  });

  it('自定义 timeStamp', () => {
    const block = new Block({ type: 'O', timeStamp: 12345 });
    expect(block.timeStamp).toBe(12345);
  });

  it('默认 timeStamp 为当前时间', () => {
    const before = Date.now();
    const block = new Block({ type: 'O' });
    const after = Date.now();
    expect(block.timeStamp).toBeGreaterThanOrEqual(before);
    expect(block.timeStamp).toBeLessThanOrEqual(after);
  });

  it('shape 是副本, 不共享引用', () => {
    const block = new Block({ type: 'O' });
    block.shape[0][0] = 9;
    expect(blockShape.O[0][0]).toBe(1); // 原始定义不被修改
  });
});

describe('Block.rotate', () => {
  it('I 方块旋转: 横 → 竖', () => {
    const block = new Block({ type: 'I' });
    expect(block.shape).toEqual([[1, 1, 1, 1]]); // 1x4

    const rotated = block.rotate();
    expect(rotated.shape).toEqual([[1], [1], [1], [1]]); // 4x1
  });

  it('I 方块旋转后 xy 应用 origin 偏移', () => {
    const block = new Block({ type: 'I', xy: [5, 5] });
    const rotated = block.rotate();
    // origin.I[0] = [-1, 1]
    expect(rotated.xy).toEqual([5 + (-1), 5 + 1]);
  });

  it('I 方块 rotateIndex 在两个状态间循环', () => {
    let block = new Block({ type: 'I' });
    expect(block.rotateIndex).toBe(0);

    let rotated = block.rotate();
    expect(rotated.rotateIndex).toBe(1);

    let block2 = new Block({ type: 'I', rotateIndex: 1 });
    let rotated2 = block2.rotate();
    // 1 + 1 >= origin.I.length (2) → 回到 0
    expect(rotated2.rotateIndex).toBe(0);
  });

  it('O 方块旋转不变 (正方形)', () => {
    const block = new Block({ type: 'O', xy: [5, 5] });
    const rotated = block.rotate();
    expect(rotated.shape).toEqual([[1, 1], [1, 1]]);
    // origin.O[0] = [0, 0]
    expect(rotated.xy).toEqual([5, 5]);
  });

  it('T 方块 4 个旋转状态循环', () => {
    let block = new Block({ type: 'T' });
    expect(block.rotateIndex).toBe(0);

    let r1 = block.rotate();
    expect(r1.rotateIndex).toBe(1);

    // 从 rotateIndex=1 继续
    let block2 = new Block({ type: 'T', rotateIndex: 1, shape: r1.shape, xy: r1.xy });
    let r2 = block2.rotate();
    expect(r2.rotateIndex).toBe(2);

    let block3 = new Block({ type: 'T', rotateIndex: 2, shape: r2.shape, xy: r2.xy });
    let r3 = block3.rotate();
    expect(r3.rotateIndex).toBe(3);

    let block4 = new Block({ type: 'T', rotateIndex: 3, shape: r3.shape, xy: r3.xy });
    let r4 = block4.rotate();
    // 3 + 1 >= origin.T.length (4) → 回到 0
    expect(r4.rotateIndex).toBe(0);
  });

  it('旋转不修改原 Block', () => {
    const block = new Block({ type: 'L', xy: [3, 3] });
    const originalShape = block.shape.map((r) => [...r]);
    block.rotate();
    expect(block.shape).toEqual(originalShape);
    expect(block.xy).toEqual([3, 3]);
  });

  it('旋转返回 BlockData 而非 Block', () => {
    const block = new Block({ type: 'O' });
    const rotated = block.rotate();
    expect(rotated).not.toBeInstanceOf(Block);
    expect(rotated.type).toBe('O');
    expect(rotated.shape).toBeDefined();
    expect(rotated.xy).toBeDefined();
    expect(rotated.rotateIndex).toBeDefined();
    expect(rotated.timeStamp).toBeDefined();
  });
});

describe('Block.fall', () => {
  it('默认下落 1 格', () => {
    const block = new Block({ type: 'O', xy: [5, 5] });
    const fallen = block.fall();
    expect(fallen.xy).toEqual([6, 5]);
  });

  it('自定义下落格数', () => {
    const block = new Block({ type: 'O', xy: [5, 5] });
    const fallen = block.fall(3);
    expect(fallen.xy).toEqual([8, 5]);
  });

  it('下落更新 timeStamp', () => {
    const block = new Block({ type: 'O', timeStamp: 1000 });
    const fallen = block.fall();
    expect(fallen.timeStamp).not.toBe(1000);
    expect(fallen.timeStamp).toBeGreaterThan(1000);
  });

  it('下落不修改原 Block', () => {
    const block = new Block({ type: 'O', xy: [5, 5] });
    block.fall();
    expect(block.xy).toEqual([5, 5]);
  });

  it('下落保持 shape', () => {
    const block = new Block({ type: 'L' });
    const fallen = block.fall();
    expect(fallen.shape).toEqual(block.shape);
    expect(fallen.shape).not.toBe(block.shape); // 是副本
  });
});

describe('Block.right', () => {
  it('右移 1 格', () => {
    const block = new Block({ type: 'O', xy: [5, 5] });
    const moved = block.right();
    expect(moved.xy).toEqual([5, 6]);
  });

  it('右移不修改原 Block', () => {
    const block = new Block({ type: 'O', xy: [5, 5] });
    block.right();
    expect(block.xy).toEqual([5, 5]);
  });

  it('右移保持 timeStamp (与 fall 不同)', () => {
    const block = new Block({ type: 'O', timeStamp: 1000 });
    const moved = block.right();
    expect(moved.timeStamp).toBe(1000);
  });
});

describe('Block.left', () => {
  it('左移 1 格', () => {
    const block = new Block({ type: 'O', xy: [5, 5] });
    const moved = block.left();
    expect(moved.xy).toEqual([5, 4]);
  });

  it('左移不修改原 Block', () => {
    const block = new Block({ type: 'O', xy: [5, 5] });
    block.left();
    expect(block.xy).toEqual([5, 5]);
  });

  it('左移保持 timeStamp', () => {
    const block = new Block({ type: 'O', timeStamp: 1000 });
    const moved = block.left();
    expect(moved.timeStamp).toBe(1000);
  });
});

describe('createBlock', () => {
  it('从 BlockData 恢复 Block 实例', () => {
    const original = new Block({ type: 'L', xy: [7, 3], rotateIndex: 0 });
    const data = original.rotate();
    const restored = createBlock(data);

    expect(restored).toBeInstanceOf(Block);
    expect(restored.type).toBe(data.type);
    expect(restored.shape).toEqual(data.shape);
    expect(restored.xy).toEqual(data.xy);
    expect(restored.rotateIndex).toBe(data.rotateIndex);
    expect(restored.timeStamp).toBe(data.timeStamp);
  });

  it('恢复后可以继续操作', () => {
    const original = new Block({ type: 'O', xy: [0, 0] });
    const fallen = original.fall();
    const restored = createBlock(fallen);
    const moved = restored.right();

    expect(moved.xy).toEqual([1, 1]);
  });

  it('恢复的 Block shape 是独立副本', () => {
    const data = {
      type: 'O' as BlockType,
      shape: [[1, 1], [1, 1]],
      xy: [0, 0] as [number, number],
      rotateIndex: 0,
      timeStamp: 0,
    };
    const restored = createBlock(data);
    restored.shape[0][0] = 9;
    expect(data.shape[0][0]).toBe(1);
  });
});
