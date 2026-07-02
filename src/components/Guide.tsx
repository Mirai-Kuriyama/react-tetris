import { memo, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useI18n } from '../i18n';
import styles from './Guide.module.css';

function GuideInner() {
  const { t } = useI18n();
  const [qrCode, setQrCode] = useState('');
  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;

  useEffect(() => {
    if (isMobile) return;
    QRCode.toDataURL(window.location.href, { margin: 1 })
      .then(setQrCode)
      .catch(() => {});
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div>
      {/* 右侧: 方向键引导 */}
      <div className={`${styles.guide} ${styles.right}`}>
        <div className={styles.up}>
          <em style={{ transform: 'translate(0,-3px) scale(1,2)' }} />
        </div>
        <div className={styles.left}>
          <em style={{ transform: 'translate(-7px,3px) rotate(-90deg) scale(1,2)' }} />
        </div>
        <div className={styles.down}>
          <em style={{ transform: 'translate(0,9px) rotate(180deg) scale(1,2)' }} />
        </div>
        <div className={styles.rightKey}>
          <em style={{ transform: 'translate(7px,3px)rotate(90deg) scale(1,2)' }} />
        </div>
      </div>

      {/* 左侧: GitHub 链接 + SPACE */}
      <div className={`${styles.guide} ${styles.left}`}>
        <p>
          <a
            href="https://github.com/chvin/react-tetris"
            rel="noopener noreferrer"
            target="_blank"
            title={t('linkTitle')}
          >
            {`${t('github')}:`}
          </a>
          <br />
          <iframe
            src="https://ghbtns.com/github-btn.html?user=chvin&repo=react-tetris&type=star&count=true"
            frameBorder={0}
            scrolling="no"
            width="170px"
            height="20px"
            style={{ transform: 'scale(1.68)', transformOrigin: 'center left' }}
          />
          <br />
          <iframe
            src="https://ghbtns.com/github-btn.html?user=chvin&repo=react-tetris&type=fork&count=true"
            frameBorder={0}
            scrolling="no"
            width="170px"
            height="20px"
            style={{ transform: 'scale(1.68)', transformOrigin: 'center left' }}
          />
        </p>
        <div className={styles.space}>SPACE</div>
      </div>

      {/* QR 码 */}
      {qrCode && (
        <div className={`${styles.guide} ${styles.qr}`}>
          <img src={qrCode} alt={t('QRCode')} />
        </div>
      )}
    </div>
  );
}

export const Guide = memo(GuideInner);
