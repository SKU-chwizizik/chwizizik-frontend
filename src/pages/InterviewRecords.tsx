import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './InterviewRecords.module.css';

interface InterviewRecord {
  interviewId: number;
  interviewAt: string;
  resultStatus: string;
}

const InterviewRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/rag/interviews?type=job')
      .then(res => setRecords(res.data))
      .catch(err => console.error('면접 기록 로드 실패', err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  return (
    <div className={styles.recordContent}>
      <h1 className={styles.mainTitle}>직무 면접 기록 보관</h1>

      <section className={styles.card}>
        {loading ? (
          <p style={{ color: '#888' }}>불러오는 중...</p>
        ) : records.length === 0 ? (
          <p style={{ color: '#888' }}>완료된 직무 면접 기록이 없습니다.</p>
        ) : (
          <div className={styles.recordGrid}>
            {records.map((record) => (
              <div
                key={record.interviewId}
                className={styles.recordBox}
                onClick={() => navigate(`/result?interviewId=${record.interviewId}`)}
              >
                <div className={styles.recordIcon}>📄</div>
                <span className={styles.recordText}>{formatDate(record.interviewAt)} 직무면접</span>
                {record.resultStatus === 'GENERATING' && (
                  <span style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>피드백 생성 중</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default InterviewRecords;
