import React from 'react';
import styles from './InterviewRecords.module.css';

const InterviewRecords = () => {
  const records = [
    "2025_10_26_직무면접", "2025_10_27_직무면접",
    "2025_10_29_일반면접", "2025_11_03_직무면접",
  ];

  const handleBoxClick = (recordName: string) => {
    // 실제 결과 페이지로 이동하는 로직을 여기에 작성
    alert(`${recordName} 결과 페이지로 이동합니다.`);
  };

  return (
    <div className={styles.recordContent}>
      <h1 className={styles.mainTitle}>모의 면접 기록 보관</h1>
      
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

export default InterviewRecords;