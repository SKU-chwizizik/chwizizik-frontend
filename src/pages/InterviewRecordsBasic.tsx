import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './InterviewRecords.module.css';

interface InterviewRecord {
  interviewId: number;
  interviewAt: string;
  resultStatus: string;
}

interface DeleteTarget {
  interviewId: number;
  name: string;
}

const InterviewRecordsBasic = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  useEffect(() => {
    axios.get('/api/rag/interviews?type=basic')
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

  const getTitle = (record: InterviewRecord) =>
    localStorage.getItem(`interview-title-${record.interviewId}`) ?? `${formatDate(record.interviewAt)} 임원 면접`;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/rag/interview/${deleteTarget.interviewId}`, { withCredentials: true });
      localStorage.removeItem(`interview-title-${deleteTarget.interviewId}`);
      setRecords(prev => prev.filter(r => r.interviewId !== deleteTarget.interviewId));
    } catch (err) {
      console.error('면접 삭제 실패', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className={styles.recordContent}>
      <h1 className={styles.mainTitle}>일반 면접 기록 보관</h1>

      <section className={styles.card}>
        {loading ? (
          <p style={{ color: '#888' }}>불러오는 중...</p>
        ) : records.length === 0 ? (
          <p style={{ color: '#888' }}>완료된 일반 면접 기록이 없습니다.</p>
        ) : (
          <div className={styles.recordGrid}>
            {records.map((record) => (
              <div
                key={record.interviewId}
                className={styles.recordBox}
                onClick={() => navigate(`/result?interviewId=${record.interviewId}`)}
              >
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ interviewId: record.interviewId, name: getTitle(record) });
                  }}
                >
                  ✕
                </button>
                <div className={styles.recordIcon}>📄</div>
                <span className={styles.recordText}>{getTitle(record)}</span>
                {record.resultStatus === 'GENERATING' && (
                  <span style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>피드백 생성 중</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>
              '{deleteTarget.name}'을<br />삭제하시겠습니까?
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setDeleteTarget(null)}>아니오</button>
              <button type="button" className={styles.modalConfirm} onClick={handleDeleteConfirm}>네</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRecordsBasic;
