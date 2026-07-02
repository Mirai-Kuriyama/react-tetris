import type { Language } from '../core/types';
import { useCallback } from 'react';

/** 支持的语言列表 */
export const languages: Language[] = ['cn', 'en', 'fr', 'fa'];

/** 默认语言 */
export const defaultLanguage: Language = 'cn';

/** i18n 数据 */
export const i18nData = {
  title: {
    cn: '俄罗斯方块',
    en: 'T E T R I S',
    fr: 'T E T R I S',
    fa: 'خانه سازی',
  },
  github: {
    cn: 'GitHub',
    en: 'GitHub',
    fr: 'GitHub',
    fa: 'گیت‌هاب',
  },
  linkTitle: {
    cn: '查看源代码',
    en: 'View data source',
    fr: 'Afficher la source des données',
    fa: 'مشاهده سورس پروژه',
  },
  QRCode: {
    cn: '二维码',
    en: 'QR code',
    fr: 'QR code',
    fa: 'کیوآر کد',
  },
  titleCenter: {
    cn: '俄罗斯方块<br />TETRIS',
    en: 'TETRIS',
    fr: 'TETRIS',
    fa: 'خانه سازی',
  },
  point: {
    cn: '得分',
    en: 'Point',
    fr: 'Score',
    fa: 'امتیاز',
  },
  highestScore: {
    cn: '最高分',
    en: 'Max',
    fr: 'Max',
    fa: 'حداکثر',
  },
  lastRound: {
    cn: '上轮得分',
    en: 'Last Round',
    fr: 'Dernier Tour',
    fa: 'آخرین دور',
  },
  cleans: {
    cn: '消除行',
    en: 'Cleans',
    fr: 'Lignes',
    fa: 'پاک کرد',
  },
  level: {
    cn: '级别',
    en: 'Level',
    fr: 'Difficulté',
    fa: 'سطح',
  },
  startLine: {
    cn: '起始行',
    en: 'Start Line',
    fr: 'Ligne Départ',
    fa: 'خط شروع',
  },
  next: {
    cn: '下一个',
    en: 'Next',
    fr: 'Prochain',
    fa: 'بعدی',
  },
  pause: {
    cn: '暂停',
    en: 'Pause',
    fr: 'Pause',
    fa: 'مکث',
  },
  sound: {
    cn: '音效',
    en: 'Sound',
    fr: 'Sonore',
    fa: 'صدا',
  },
  reset: {
    cn: '重玩',
    en: 'Reset',
    fr: 'Réinitialiser',
    fa: 'ریست',
  },
  rotation: {
    cn: '旋转',
    en: 'Rotation',
    fr: 'Rotation',
    fa: 'چرخش',
  },
  left: {
    cn: '左移',
    en: 'Left',
    fr: 'Gauche',
    fa: 'چپ',
  },
  right: {
    cn: '右移',
    en: 'Right',
    fr: 'Droite',
    fa: 'راست',
  },
  down: {
    cn: '下移',
    en: 'Down',
    fr: 'Bas',
    fa: 'پایین',
  },
  drop: {
    cn: '掉落',
    en: 'Drop',
    fr: 'Tomber',
    fa: 'سقوط',
  },
  pressAnyKey: {
    cn: '按任意键开始',
    en: 'Press any key',
    fr: 'Appuyez sur une touche',
    fa: 'هر کلیدی را فشار دهید',
  },
  direction: {
    cn: '方向',
    en: 'Direction',
    fr: 'Direction',
    fa: 'جهت',
  },
  desktop: {
    cn: '桌面',
    en: 'Desktop',
    fr: 'Bureau',
    fa: 'دسکتاپ',
  },
  mobile: {
    cn: '手机',
    en: 'Mobile',
    fr: 'Mobile',
    fa: 'موبایل',
  },
  linkTip: {
    cn: '扫码在手机玩',
    en: 'Scan QR Code',
    fr: 'Scanner QR Code',
    fa: 'اسکن کیوآر کد',
  },
} as const;

/** 从 URL 参数获取语言 */
function getLanguage(): Language {
  const params = new URLSearchParams(window.location.search);
  const l = params.get('lan')?.toLowerCase() as Language;
  return languages.includes(l) ? l : defaultLanguage;
}

/** 当前语言 */
export const lan: Language = getLanguage();

/** 设置页面标题 */
if (typeof document !== 'undefined') {
  document.title = i18nData.title[lan];
}

/** 获取 i18n 文本 */
export function t(key: keyof typeof i18nData): string {
  return i18nData[key][lan];
}

/** React Hook: 获取翻译函数 */
export function useI18n() {
  const language = lan;
  const translate = useCallback(
    (key: string): string => {
      const entry = i18nData[key as keyof typeof i18nData];
      return entry ? (entry as Record<string, string>)[language] ?? key : key;
    },
    [language]
  );
  return { t: translate, language };
}
