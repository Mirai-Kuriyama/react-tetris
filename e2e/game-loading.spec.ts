import { test, expect } from '@playwright/test';

test.describe('游戏加载', () => {
  test('页面正确加载', async ({ page }) => {
    await page.goto('/');
    // i18n 模块会设置 document.title 为当前语言的标题
    await expect(page).toHaveTitle('俄罗斯方块');
  });

  test('loading 元素被隐藏或移除', async ({ page }) => {
    await page.goto('/');
    // 等待 React 渲染完成 (canvas 出现意味着 app 已加载)
    await page.waitForSelector('canvas', { timeout: 5000 });
    // React 会替换 #root 内容, #loading 可能已不在 DOM 中
    // 或仍存在但带有 hidden 类
    const loadingExists = await page.locator('#loading').count();
    if (loadingExists > 0) {
      await expect(page.locator('#loading')).toHaveClass(/hidden/);
    }
    // 无论哪种情况, canvas 应可见
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('Canvas 元素存在', async ({ page }) => {
    await page.goto('/');
    // 等待 React 渲染完成
    await page.waitForSelector('canvas', { timeout: 5000 });
    const canvases = page.locator('canvas');
    const count = await canvases.count();
    // 至少有游戏矩阵 canvas 和 next 预览 canvas
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('游戏矩阵 Canvas 尺寸正确', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 5000 });
    const canvases = page.locator('canvas');
    const first = canvases.first();
    // MatrixRenderer: 10*22 + border = 228, 20*22 + border = 448
    await expect(first).toHaveAttribute('width', '228');
    await expect(first).toHaveAttribute('height', '448');
  });

  test('无控制台错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 5000 });
    // 等待一段时间确保没有异步错误
    await page.waitForTimeout(1000);
    // 过滤掉已知的非关键错误 (如音频加载)
    const criticalErrors = errors.filter(
      (e) => !e.includes('AudioContext') && !e.includes('audio')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('页面背景色正确', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(bg).toBe('rgb(0, 150, 136)'); // #009688
  });
});
