# 俄罗斯方块 React Tetris

经典俄罗斯方块游戏的现代化重构版。

基于原项目 [chvin/react-tetris](https://github.com/chvin/react-tetris)，借助 AI 辅助，使用现代前端技术栈完成全面重构，并集成了 PWA 技术以实现离线可玩。

**在线体验：** https://mirai-kuriyama.github.io/react-tetris/

## 技术栈

| 技术 | 说明 |
|------|------|
| React 18 | 函数式组件 + Hooks |
| TypeScript | 全量类型安全 |
| Vite 5 | 快速构建与热更新 |
| Zustand | 轻量状态管理 |
| Canvas 2D | 游戏矩阵与预览渲染 |
| CSS Modules | 局部作用域样式 |
| Workbox (vite-plugin-pwa) | Service Worker 自动注册与离线缓存 |
| Vitest | 单元测试（107 用例） |
| Playwright | E2E 端到端测试（17 用例） |

## 与原项目的区别

原项目 [chvin/react-tetris](https://github.com/chvin/react-tetris) 基于 React 16 + Webpack 3 + Redux 构建。本项目在保留全部游戏玩法与视觉风格的前提下，进行了现代化改造：

| 维度 | 原项目 | 本项目 |
|------|--------|--------|
| 框架 | React 16 (Class 组件) | React 18 (函数组件 + Hooks) |
| 语言 | JavaScript | TypeScript (严格模式) |
| 构建 | Webpack 3 | Vite 5 |
| 状态管理 | Redux + react-redux | Zustand |
| 样式 | LESS + BEM | CSS Modules |
| 渲染 | DOM 矩阵 (200 个 div) | Canvas 2D (单 canvas) |
| 持久化 | 手动 JSON | Zustand + 防抖自动保存 |
| PWA | 手动 Service Worker | vite-plugin-pwa (autoUpdate) |
| 测试 | 无 | Vitest 单元测试 + Playwright E2E |
| 包管理 | npm | pnpm |

## 功能特性

- **离线可玩** — PWA 技术，安装后无需网络即可游玩
- **状态持久化** — 自动保存进度，刷新或关闭不丢档
- **响应式适配** — 支持各种屏幕尺寸，移动端自动缩放
- **键盘 + 触控** — 桌面端键盘操作，移动端虚拟按键
- **音效系统** — 旋转、移动、消除、结束等场景均有音效反馈
- **多语言** — 中文 / English / Français / فارسی
- **消除动画** — 行消除闪烁动画，游戏结束填充动画
- **速度系统** — 消除行数越多速度越快，最高 6 级
- **起始行** — 可自定义 0-10 行起始干扰行

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生产构建
pnpm build

# 预览生产构建
pnpm preview
```

## 测试

```bash
# 单元测试
pnpm test

# 单元测试（覆盖率）
pnpm test:coverage

# E2E 测试
pnpm test:e2e

# E2E 测试（可视化界面）
pnpm test:e2e:ui
```

### 测试覆盖

| 测试类型 | 框架 | 用例数 | 覆盖范围 |
|----------|------|--------|----------|
| 单元测试 | Vitest + jsdom | 107 | 游戏逻辑、方块操作、状态管理、持久化、键盘映射 |
| E2E 测试 | Playwright + Chromium | 17 | 页面加载、游戏操作、消除流程、持久化恢复 |

## 部署

`git push` 到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

```bash
git push origin main
```

PWA 配置了 `autoUpdate` 策略，每次部署后用户下次打开即自动更新，无需手动干预。

## 项目结构

```
src/
├── core/               # 游戏核心逻辑
│   ├── Block.ts            # 方块类 (旋转/移动/下落)
│   ├── GameController.ts   # 游戏状态机 (开始/消除/结束)
│   ├── gameLogic.ts        # 纯函数 (碰撞检测/消除检测/合并)
│   ├── constants.ts        # 常量 (形状/颜色/速度)
│   └── types.ts            # 类型定义
├── engine/             # 渲染引擎
│   ├── MatrixRenderer.ts   # 游戏矩阵 Canvas 渲染器
│   └── NextRenderer.ts     # 下一方块预览渲染器
├── input/              # 输入系统
│   ├── InputManager.ts     # 键盘 + 触控输入管理
│   ├── eventRepeat.ts      # 按键连发机制
│   └── keyboardMap.ts      # 按键映射
├── store/              # 状态管理
│   └── gameStore.ts        # Zustand store
├── storage/            # 持久化
│   └── persist.ts          # localStorage 防抖保存
├── audio/              # 音频系统
│   └── AudioManager.ts     # Web Audio API 音效管理
├── components/         # React 组件
│   ├── GameCanvas.tsx      # 游戏矩阵 Canvas
│   ├── NextCanvas.tsx      # 下一方块预览
│   ├── Controls.tsx        # 音效/暂停按钮
│   ├── Keyboard.tsx        # 移动端虚拟按键
│   ├── Guide.tsx           # 键盘操作指南
│   ├── Decorate.tsx        # 边框装饰
│   ├── Logo.tsx            # TETRIS Logo
│   └── Point.tsx           # LED 数字显示
├── hooks/              # 自定义 Hooks
│   ├── useResize.ts        # 响应式缩放
│   └── useVisibility.ts    # 页面可见性检测
├── i18n/               # 国际化
│   └── index.ts            # 多语言文本
├── styles/             # 全局样式
└── main.tsx            # 应用入口
```

## 操作说明

| 按键 | 功能 |
|------|------|
| ↑ | 旋转 |
| ← → | 左右移动 |
| ↓ | 加速下落 |
| 空格 | 硬降 / 开始游戏 |
| P | 暂停 / 继续 |
| R | 重置 |
| S | 切换音效 |

待机状态下，← → 调节起始速度，↑ ↓ 调节起始干扰行数。

## 致谢

- 原项目：[chvin/react-tetris](https://github.com/chvin/react-tetris)
- 游戏素材与玩法来自原版俄罗斯方块
