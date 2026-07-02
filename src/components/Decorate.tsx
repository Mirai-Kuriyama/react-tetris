import { memo } from 'react';
import { useI18n } from '../i18n';
import styles from './Decorate.module.css';

const DecorateInner = () => {
  const { t } = useI18n();
  return (
    <div className={styles.decorate}>
      <div className={styles.topBorder}>
        <span className={styles.floatLeft + ' ' + styles.mr} style={{ width: 40 }} />
        <span className={styles.floatLeft + ' ' + styles.mr} />
        <span className={styles.floatLeft + ' ' + styles.mr} />
        <span className={styles.floatLeft + ' ' + styles.mr} />
        <span className={styles.floatLeft + ' ' + styles.mr} />
        <span className={styles.floatRight + ' ' + styles.ml} style={{ width: 40 }} />
        <span className={styles.floatRight + ' ' + styles.ml} />
        <span className={styles.floatRight + ' ' + styles.ml} />
        <span className={styles.floatRight + ' ' + styles.ml} />
        <span className={styles.floatRight + ' ' + styles.ml} />
      </div>
      <h1 className={styles.title}>{t('title')}</h1>
      <div className={styles.view}>
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <em />
        <b className={styles.c} />
        <p />
        <em />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <em />
        <b className={styles.c} />
        <p />
        <b className={styles.c} />
        <b className={styles.c} />
        <b className={styles.c} />
        <b className={styles.c} />
        <p />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <p />
        <b className={styles.c} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <p />
        <em />
        <b className={styles.c} />
        <div className={styles.clear} />
        <em />
        <b className={styles.c} />
        <div className={styles.clear} />
        <em />
        <b className={styles.c} />
        <div className={styles.clear} />
        <em />
        <b className={styles.c} />
      </div>
      <div className={styles.view + ' ' + styles.viewLeft}>
        <em />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <p />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <p />
        <b className={styles.c} />
        <b className={styles.c} />
        <b className={styles.c} />
        <b className={styles.c} />
        <p />
        <em />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <em />
        <b className={styles.c} />
        <p />
        <b className={styles.c} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <em />
        <b className={styles.c} />
        <div className={styles.clear} />
        <em />
        <b className={styles.c} />
        <p />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
        <div className={styles.clear} />
        <b className={styles.c} />
      </div>
    </div>
  );
};

export const Decorate = memo(DecorateInner);
