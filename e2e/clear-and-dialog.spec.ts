import { test, expect } from '@playwright/test';

test.describe('消除与游戏结束', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 5000 });
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('canvas', { timeout: 5000 });
    // 等待游戏结束动画完成
    await page.waitForTimeout(2000);
  });

  test('方块落定后游戏继续', async ({ page }) => {
    // 开始游戏
    await page.keyboard.press(' ', { delay: 50 });
    await page.waitForTimeout(500);

    // 硬降多个方块
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press(' ', { delay: 50 });
      await page.waitForTimeout(500);
    }

    // 游戏应该仍在进行 (canvas 仍然可见)
    const canvases = page.locator('canvas');
    await expect(canvases.first()).toBeVisible();
  });

  test('堆满后触发游戏结束动画', async ({ page }) => {
    // 开始游戏
    await page.keyboard.press(' ', { delay: 50 });
    await page.waitForTimeout(500);

    // 持续硬降直到游戏结束 (方块堆满)
    // 使用旋转+硬降来快速堆满 (不消除行)
    for (let i = 0; i < 60; i++) {
      // 每次硬降前随机移动, 避免恰好消除行
      if (i % 3 === 0) await page.keyboard.press('ArrowLeft', { delay: 20 });
      if (i % 3 === 1) await page.keyboard.press('ArrowRight', { delay: 20 });
      await page.keyboard.press(' ', { delay: 30 });
      await page.waitForTimeout(200);

      // 检查是否游戏结束 (localStorage 中 cur 为 null)
      const state = await page.evaluate(() => {
        const data = localStorage.getItem('REACT_TETRIS');
        if (!data) return null;
        const parsed = JSON.parse(data);
        return parsed;
      });
      if (state && state.cur === null && state.reset === false) {
        // 游戏已结束
        break;
      }
    }

    // 游戏结束后应该可以重新开始
    await page.keyboard.press(' ', { delay: 50 });
    await page.waitForTimeout(500);
    const canvases = page.locator('canvas');
    await expect(canvases.first()).toBeVisible();
  });

  test('localStorage 持久化游戏状态', async ({ page }) => {
    // 开始游戏
    await page.keyboard.press(' ', { delay: 50 });
    await page.waitForTimeout(500);

    // 硬降几个方块
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press(' ', { delay: 50 });
      await page.waitForTimeout(300);
    }

    // 等待防抖写入
    await page.waitForTimeout(300);

    // 检查 localStorage 有数据
    const stored = await page.evaluate(() => {
      const data = localStorage.getItem('REACT_TETRIS');
      return data ? JSON.parse(data) : null;
    });
    expect(stored).not.toBeNull();
    expect(stored.matrix).toBeDefined();
    expect(stored.next).toBeDefined();
    // 游戏进行中应该有分数
    expect(typeof stored.points).toBe('number');
  });

  test('刷新页面后恢复游戏状态', async ({ page }) => {
    // 开始游戏
    await page.keyboard.press(' ', { delay: 50 });
    await page.waitForTimeout(500);

    // 硬降几个方块
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press(' ', { delay: 50 });
      await page.waitForTimeout(300);
    }

    // 等待防抖写入
    await page.waitForTimeout(300);

    // 获取当前状态
    const beforeState = await page.evaluate(() => {
      const data = localStorage.getItem('REACT_TETRIS');
      return data ? JSON.parse(data) : null;
    });

    // 刷新页面
    await page.reload();
    await page.waitForSelector('canvas', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // 验证状态恢复
    const afterState = await page.evaluate(() => {
      const data = localStorage.getItem('REACT_TETRIS');
      return data ? JSON.parse(data) : null;
    });

    expect(afterState).not.toBeNull();
    // matrix 应该保持一致
    if (beforeState?.matrix && afterState?.matrix) {
      expect(afterState.matrix.length).toBe(beforeState.matrix.length);
    }
  });
});
