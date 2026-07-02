import type { AudioSegment } from '../core/types';

interface AudioConfig {
  offset: number;
  duration: number;
}

/** 音频片段配置 (offset, duration) - 保持与原项目一致 */
const SEGMENTS: Record<AudioSegment, AudioConfig> = {
  start:    { offset: 3.7202, duration: 3.6224 },
  clear:    { offset: 0,      duration: 0.7675 },
  fall:     { offset: 1.2558, duration: 0.3546 },
  gameover: { offset: 8.1276, duration: 1.1437 },
  rotate:   { offset: 2.2471, duration: 0.0807 },
  move:     { offset: 2.9088, duration: 0.1437 },
};

/**
 * 音频管理器: 使用 Web Audio API 播放音效
 * 单例模式
 */
export class AudioManager {
  private context: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private enabled = false;
  private getMusicOn: () => boolean;

  constructor(getMusicOn: () => boolean) {
    this.getMusicOn = getMusicOn;
    this.init();
  }

  private init(): void {
    const w = window as any;
    const AudioCtx = w.AudioContext || w.webkitAudioContext;
    if (!AudioCtx) return;
    // 仅在 http/https 协议下启用
    if (location.protocol.indexOf('http') === -1) return;

    this.context = new AudioCtx();
    this.enabled = true;

    const url = './music.mp3';
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    req.onload = () => {
      if (!this.context) return;
      this.context.decodeAudioData(req.response, (buf) => {
        this.buffer = buf;
      }, (error) => {
        console.error(`音频: ${url} 读取错误`, error);
        this.enabled = false;
      });
    };
    req.send();
  }

  /** 播放指定片段 */
  play(segment: AudioSegment): void {
    if (!this.enabled || !this.context || !this.buffer) return;
    if (!this.getMusicOn()) return;

    // Chrome 自动播放策略: AudioContext 可能处于 suspended 状态, 需 resume
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    const source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.context.destination);
    const cfg = SEGMENTS[segment];
    source.start(0, cfg.offset, cfg.duration);
  }

  /** 游戏开始音乐只播放一次 */
  private startPlayed = false;
  playStart(): void {
    if (this.startPlayed) return;
    this.startPlayed = true;
    this.play('start');
  }
}

/** 全局音频管理器实例 */
let audioManager: AudioManager | null = null;

/** 初始化音频管理器 */
export function initAudioManager(getMusicOn: () => boolean): AudioManager {
  audioManager = new AudioManager(getMusicOn);
  return audioManager;
}

/** 获取音频管理器 */
export function getAudioManager(): AudioManager | null {
  return audioManager;
}
