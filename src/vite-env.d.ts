/// <reference types="vite/client" />

/** CSS Module 类型声明 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

/** CSS 类型声明 */
declare module '*.css' {
  const css: string;
  export default css;
}

/** 图片类型声明 */
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

/** 音频类型声明 */
declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}
