import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from "./Result.module.css";

interface QuestionResult {
  order: number;
  questionId: number;
  questionText: string;
  answerText: string;
  intent: string | null;
  feedback: string | null;
  improvedAnswer: string | null;
}

interface ResultData {
  status: "GENERATING" | "READY";
  summary: string | null;
  softskillAnalysis: string | null;
  questions: QuestionResult[];
}

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const keys = Object.keys(scores);
  const values = keys.map((k) => scores[k] ?? 0);
  const n = keys.length;
  if (n === 0) return null;

  const cx = 150;
  const cy = 150;
  const r = 110;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const angleOf = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, ratio: number) => ({
    x: cx + r * ratio * Math.cos(angleOf(i)),
    y: cy + r * ratio * Math.sin(angleOf(i)),
  });
  const gridPolygon = (ratio: number) =>
    keys.map((_, i) => { const p = point(i, ratio); return `${p.x},${p.y}`; }).join(" ");
  const dataPolygon = keys
    .map((k, i) => { const p = point(i, (scores[k] ?? 0) / 100); return `${p.x},${p.y}`; })
    .join(" ");

  return (
    <svg viewBox="0 0 300 300" className={styles.radarSvg}>
      {levels.map((ratio) => (
        <polygon key={ratio} points={gridPolygon(ratio)} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {keys.map((_, i) => {
        const p = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={dataPolygon} fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth="2" />
      {keys.map((k, i) => {
        const lp = point(i, 1.22);
        return (
          <text key={k} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#374151">
            {k}
          </text>
        );
      })}
      {keys.map((k, i) => {
        const sp = point(i, (scores[k] ?? 0) / 100);
        return <circle key={k} cx={sp.x} cy={sp.y} r="4" fill="#2563eb" />;
      })}
    </svg>
  );
}

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const interviewId = searchParams.get("interviewId") ?? "";

  const [data, setData] = useState<ResultData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "detail">("overview");
  const [selectedQ, setSelectedQ] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!interviewId) return;
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/api/rag/result/${interviewId}`, { withCredentials: true });
        setData(res.data);
        if (res.data.status === "READY" && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch (err) {
        console.error("결과 조회 실패:", err);
      }
    };
    fetchResult();
    pollRef.current = setInterval(fetchResult, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [interviewId]);

  const softskillScores: Record<string, number> = (() => {
    if (!data?.softskillAnalysis) return {};
    try {
      const parsed = JSON.parse(data.softskillAnalysis);
      return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  })();

  if (!data || data.status === "GENERATING") {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}>
          <div className={styles.doubleBounce1} />
          <div className={styles.doubleBounce2} />
        </div>
        <p className={styles.loadingText}>AI가 면접 결과를 분석 중입니다...</p>
        <p className={styles.loadingHint}>잠시만 기다려 주세요</p>
      </div>
    );
  }

  const currentQ = data.questions[selectedQ];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 타이틀 */}
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>AI 피드백</h1>
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              종합 분석
            </button>
            <span className={styles.tabDivider}>|</span>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "detail" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("detail")}
            >
              상세 분석
            </button>
          </div>
        </div>

        {/* 종합 분석 */}
        {activeTab === "overview" && (
          <div className={styles.tabContent}>
            {data.summary && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>면접 총평</h2>
                <p className={styles.summaryText}>{data.summary}</p>
              </section>
            )}
            {Object.keys(softskillScores).length > 0 && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>소프트스킬 분석</h2>
                <div className={styles.radarWrapper}>
                  <RadarChart scores={softskillScores} />
                </div>
                <ul className={styles.scoreList}>
                  {Object.entries(softskillScores).map(([label, score]) => (
                    <li key={label} className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>{label}</span>
                      <div className={styles.scoreBar}>
                        <div className={styles.scoreBarFill} style={{ width: `${score}%` }} />
                      </div>
                      <span className={styles.scoreValue}>{score}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>음성 분석</h2>
              <p className={styles.placeholderText}>준비 중입니다.</p>
            </section>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>제스처 분석</h2>
              <p className={styles.placeholderText}>준비 중입니다.</p>
            </section>
          </div>
        )}

        {/* 상세 분석 */}
        {activeTab === "detail" && data.questions.length > 0 && (
          <div className={styles.tabContent}>
            {/* Q1~QN 탭 네비게이션 */}
            <div className={styles.qTabRow}>
              {data.questions.map((q, idx) => (
                <button
                  key={q.questionId}
                  type="button"
                  className={`${styles.qTab} ${selectedQ === idx ? styles.qTabActive : ""}`}
                  onClick={() => setSelectedQ(idx)}
                >
                  Q{q.order}
                </button>
              ))}
            </div>

            {/* 선택된 질문 상세 */}
            {currentQ && (
              <div className={styles.detailCard}>
                <p className={styles.questionText}>{currentQ.questionText}</p>

                {currentQ.intent && (
                  <div className={styles.feedbackBlock}>
                    <span className={styles.feedbackBadge}>질문 의도</span>
                    <p className={styles.feedbackContent}>{currentQ.intent}</p>
                  </div>
                )}
                {currentQ.answerText && (
                  <div className={styles.feedbackBlock}>
                    <span className={`${styles.feedbackBadge} ${styles.badgeAnswer}`}>내 답변</span>
                    <p className={`${styles.feedbackContent} ${styles.myAnswer}`}>{currentQ.answerText}</p>
                  </div>
                )}
                {currentQ.feedback && (
                  <div className={styles.feedbackBlock}>
                    <span className={`${styles.feedbackBadge} ${styles.badgeFeedback}`}>답변 상세 피드백</span>
                    <p className={styles.feedbackContent}>{currentQ.feedback}</p>
                  </div>
                )}
                {currentQ.improvedAnswer && (
                  <div className={styles.feedbackBlock}>
                    <span className={`${styles.feedbackBadge} ${styles.badgeImproved}`}>개선된 답변</span>
                    <p className={`${styles.feedbackContent} ${styles.improvedAnswer}`}>{currentQ.improvedAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <button type="button" className={styles.homeButton} onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
