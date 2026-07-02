/** 方块类型 */
export type BlockType = 'I' | 'L' | 'J' | 'Z' | 'S' | 'O' | 'T';

/** 所有方块类型数组 */
export const BLOCK_TYPES: BlockType[] = ['I', 'L', 'J', 'Z', 'S', 'O', 'T'];

/** 方块形状 (二维数组, 1=有方块, 0=无方块) */
export type Shape = number[][];

/** 坐标 [row, col] */
export type XY = [number, number];

/** 方块数据 (不可变, 每次操作返回新对象) */
export interface BlockData {
  type: BlockType;
  shape: Shape;
  xy: XY;
  rotateIndex: number;
  timeStamp: number;
}

/** 构造方块时的参数 */
export interface BlockOption {
  type: BlockType;
  shape?: Shape;
  xy?: XY;
  rotateIndex?: number;
  timeStamp?: number;
  reset?: boolean;
}

/** 矩阵数据 (20行x10列, 0=空, 1=有方块, 2=重合) */
export type MatrixData = number[][];

/** 键盘按键状态 */
export interface KeyboardState {
  drop: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  rotate: boolean;
  reset: boolean;
  music: boolean;
  pause: boolean;
}

/** 动作类型 */
export type ActionType = 'left' | 'right' | 'down' | 'rotate' | 'space' | 'r' | 'p' | 's';

/** 游戏状态接口 */
export interface GameState {
  pause: boolean;
  music: boolean;
  matrix: MatrixData;
  next: BlockType;
  cur: BlockData | null;
  startLines: number;
  max: number;
  points: number;
  speedStart: number;
  speedRun: number;
  lock: boolean;
  clearLines: number;
  clearingLines: number[];
  reset: boolean;
  drop: boolean;
  keyboard: KeyboardState;
  focus: boolean;
}

/** 音频片段类型 */
export type AudioSegment = 'start' | 'clear' | 'fall' | 'gameover' | 'rotate' | 'move';

/** 语言类型 */
export type Language = 'cn' | 'en' | 'fr' | 'fa';
