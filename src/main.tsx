import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import { App } from './App';
import { initInput } from './input/InputManager';
import { subscribePersist } from './storage/persist';
import { useGameStore } from './store/gameStore';
import { initGameController, getGameController } from './core/GameController';
import { initAudioManager } from './audio/AudioManager';

// 初始化游戏控制器
const controller = initGameController(useGameStore as any);

// 初始化音频管理器
const audio = initAudioManager(() => useGameStore.getState().music);

// 连接音频到游戏控制器
controller.audioManager = audio;

// 初始化键盘/触摸输入
initInput();

// 订阅状态变化, 持久化到 localStorage
subscribePersist(useGameStore as any);

// 移除 loading
const loading = document.getElementById('loading');
if (loading) loading.classList.add('hidden');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
