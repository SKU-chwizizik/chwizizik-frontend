import React from 'react';
import styles from './InterviewRecordsBasic.module.css';

// 1. 인자값(props)을 아예 받지 않도록 ()로 수정합니다.
const InterviewRecordsBasic = () => {
  
  // 2. 일반 면접 전용 화면이므로 타이틀을 고정합니다. (type 조건문 삭제)
  const displayTitle = "일반 면접 기록 보관";

  // 3. 하드코딩 리스트
  const records = [
    "2025_10_26_일반면접", 
    "2025_10_29_일반면접", 
  ];

  const handleBoxClick = (recordName: string) => {
    alert(`${recordName} 결과 페이지로 이동합니다.`);
  };

  return (
    <div className={styles.recordContent}>
      <h1 className={styles.mainTitle}>{displayTitle}</h1>
      
      <section className={styles.card}>
        <div className={styles.recordGrid}>
          {records.map((record, index) => (
            <div 
              key={index} 
              className={styles.recordBox}
              onClick={() => handleBoxClick(record)}
            >
              <div className={styles.recordIcon}>📄</div>
              <span className={styles.recordText}>{record}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InterviewRecordsBasic;