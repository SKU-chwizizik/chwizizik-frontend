import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from "./Result.module.css";

interface QuestionResult {
  order: number | null;
  questionId: number;
  questionText: string;
  answerText: string;
  answerSummary: string | null;
  intent: string | null;
  feedback: string | null;
  improvedAnswer: string | null;
  isFollowUp: boolean;
  parentOrder: number | null;
  followupIndex: number | null;
}

interface SkillData {
  score: number;
  evidence: string;
  weakness: string;
}

interface VoiceData {
  avgSpm: number;
  totalSpeechSeconds: number;
  avgSilenceRatio: number;
  questionCount: number;
}

interface NonverbalData {
  smileRate: number;
  alertnessScore: number;
  expressionScore: number;
  sampleCount: number;
}

interface ResultData {
  status: "GENERATING" | "READY";
  interviewType: string | null;
  interviewAt: string | null;
  summary: string | null;
  softskillAnalysis: string | null;
  voiceAnalysis: string | null;
  nonverbalAnalysis: string | null;
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
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!interviewId) return;
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/api/rag/result/${interviewId}`, { withCredentials: true });
        setData(res.data);
        // 저장된 이름이 없으면 기본값 설정 (InterviewRecords와 동일한 포맷)
        const storageKey = `interview-title-${interviewId}`;
        if (!localStorage.getItem(storageKey)) {
          const d = res.data as ResultData;
          const typeName = d.interviewType === "job" ? "직무 면접" : "임원 면접";
          const raw = d.interviewAt ?? "";
          const dateFormatted = raw.length >= 10
            ? `${raw.substring(0, 4)}.${raw.substring(5, 7)}.${raw.substring(8, 10)}`
            : "";
          const baseTitle = `${dateFormatted} ${typeName}`;
          // 같은 날짜+유형 제목 중복 시 (N) 접미사 부여
          const existingTitles = Object.keys(localStorage)
            .filter(k => k.startsWith("interview-title-") && k !== storageKey)
            .map(k => localStorage.getItem(k) ?? "");
          const dupeCount = existingTitles.filter(
            t => t === baseTitle || t.startsWith(`${baseTitle} (`)
          ).length;
          const finalTitle = dupeCount === 0 ? baseTitle : `${baseTitle} (${dupeCount})`;
          localStorage.setItem(storageKey, finalTitle);
          setTitleValue(finalTitle);
        } else {
          setTitleValue(localStorage.getItem(storageKey)!);
        }
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

  // 구형(숫자) / 신형(객체) 모두 처리
  const softskillData: Record<string, number | SkillData> = (() => {
    if (!data?.softskillAnalysis) return {};
    try {
      const parsed = JSON.parse(data.softskillAnalysis);
      return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  })();

  const voiceData: VoiceData | null = (() => {
    if (!data?.voiceAnalysis) return null;
    try { return JSON.parse(data.voiceAnalysis); }
    catch { return null; }
  })();

  const nonverbal: NonverbalData | null = (() => {
    if (!data?.nonverbalAnalysis) return null;
    try { return JSON.parse(data.nonverbalAnalysis); }
    catch { return null; }
  })();

  const getNonverbalFeedback = (nv: NonverbalData): string => {
    const lines: string[] = [];
    if (nv.smileRate >= 30) {
      lines.push("면접 내내 자연스러운 미소를 유지해 호감을 주었습니다.");
    } else if (nv.smileRate >= 15) {
      lines.push("미소가 적절히 나타났으나, 조금 더 편안한 표정을 유지해 보세요.");
    } else {
      lines.push("미소가 부족했습니다. 자연스러운 미소는 면접관에게 긍정적인 인상을 남깁니다.");
    }
    if (nv.alertnessScore >= 80) {
      lines.push("눈을 잘 뜨고 집중하는 모습이 돋보였습니다.");
    } else if (nv.alertnessScore >= 60) {
      lines.push("전반적으로 집중하는 모습이었으나, 시선이 간혹 분산되었습니다.");
    } else {
      lines.push("눈을 자주 내리깔거나 시선이 분산되는 경향이 있었습니다. 카메라를 정면으로 바라보는 연습을 해보세요.");
    }
    return lines.join(" ");
  };

  const nonverbalValueClass = (score: number, good: number, normal: number) => {
    if (score >= good) return styles.nonverbalValueGood;
    if (score >= normal) return styles.nonverbalValueNormal;
    return styles.nonverbalValuePoor;
  };

  const voiceSpmClass = (spm: number) => {
    if (spm >= 250 && spm <= 300) return styles.nonverbalValueGood;
    if (spm >= 200 && spm <= 350) return styles.nonverbalValueNormal;
    return styles.nonverbalValuePoor;
  };

  const voiceRatioClass = (ratio: number) => {
    if (ratio >= 70) return styles.nonverbalValueGood;
    if (ratio >= 50) return styles.nonverbalValueNormal;
    return styles.nonverbalValuePoor;
  };

  const getVoiceFeedback = (vd: VoiceData): string => {
    const lines: string[] = [];
    const spm = vd.avgSpm;
    if (spm < 200) {
      lines.push("발화 속도가 느려 준비 부족으로 느껴질 수 있습니다. 핵심을 명확히 전달하는 연습이 필요합니다.");
    } else if (spm < 250) {
      lines.push("약간 느린 편입니다. 좀 더 자신감 있게 말하는 연습을 해보세요.");
    } else if (spm <= 300) {
      lines.push("이상적인 발화 속도입니다. 안정감 있는 전달력을 보여주었습니다.");
    } else if (spm <= 350) {
      lines.push("약간 빠른 편입니다. 중요한 내용에서는 속도를 조절해 보세요.");
    } else {
      lines.push("발화 속도가 매우 빠릅니다. 긴장으로 인한 과속은 전달력을 떨어뜨릴 수 있습니다.");
    }
    const phonationPct = Math.round((1 - vd.avgSilenceRatio) * 100);
    if (phonationPct >= 70) {
      lines.push("답변 내내 꾸준히 말하여 유창성이 좋았습니다.");
    } else if (phonationPct >= 50) {
      lines.push("적절한 휴지를 취하며 답변했습니다. 침묵을 전략적으로 활용하고 있습니다.");
    } else {
      lines.push("침묵 구간이 많아 답변이 단절되는 인상을 줄 수 있습니다. 더 많은 내용을 준비해 보세요.");
    }
    return lines.join(" ");
  };

  const getScore = (v: number | SkillData): number =>
    typeof v === "number" ? v : (v?.score ?? 0);

  const softskillScores: Record<string, number> = Object.fromEntries(
    Object.entries(softskillData).map(([k, v]) => [k, getScore(v)])
  );

  const skillSectionTitle = "기술깊이" in softskillScores ? "역량 분석" : "소프트스킬 분석";

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

  // "질문 {questionId}" → "Q{order}" 치환 (LLM이 DB ID로 참조하는 것을 사용자 친화적으로 변환)
  const questionIdToLabel = Object.fromEntries(
    data.questions.map((q) => [
      q.questionId,
      q.isFollowUp ? `Q${q.parentOrder}-${q.followupIndex}` : `Q${q.order}`,
    ])
  );
  const replaceQuestionRefs = (text: string | null): string | null => {
    if (!text) return text;
    return text.replace(/질문\s*(\d+)/g, (_, id) => {
      const label = questionIdToLabel[Number(id)];
      return label != null ? label : `질문 ${id}`;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 타이틀 */}
        <div className={styles.titleSection}>
          {isEditingTitle ? (
            <input
              className={styles.pageTitleInput}
              value={titleValue}
              autoFocus
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={() => {
                const trimmed = titleValue.trim();
                if (trimmed) {
                  localStorage.setItem(`interview-title-${interviewId}`, trimmed);
                  setTitleValue(trimmed);
                }
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
            />
          ) : (
            <h1
              className={styles.pageTitle}
              title="클릭하여 이름 수정"
              onClick={() => setIsEditingTitle(true)}
            >
              {titleValue}
              <span className={styles.titleEditIcon}>✎</span>
            </h1>
          )}
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
                <h2 className={styles.cardTitle}>{skillSectionTitle}</h2>
                <div className={styles.radarWrapper}>
                  <RadarChart scores={softskillScores} />
                </div>
                <ul className={styles.scoreList}>
                  {Object.entries(softskillData).map(([label, val]) => {
                    const score = getScore(val);
                    const detail = typeof val === "object" && val !== null ? val as SkillData : null;
                    const hasDetail = !!(detail?.evidence || detail?.weakness);
                    const isExpanded = expandedSkill === label;
                    return (
                      <li key={label} className={styles.scoreItem}>
                        <div
                          className={`${styles.scoreRow} ${hasDetail ? styles.scoreRowClickable : ""}`}
                          onClick={() => hasDetail && setExpandedSkill(isExpanded ? null : label)}
                        >
                          <span className={styles.scoreLabel}>{label}</span>
                          <div className={styles.scoreBar}>
                            <div className={styles.scoreBarFill} style={{ width: `${score}%` }} />
                          </div>
                          <span className={styles.scoreValue}>{score}</span>
                          {hasDetail && (
                            <span className={styles.scoreToggle}>{isExpanded ? "▲" : "▼"}</span>
                          )}
                        </div>
                        {isExpanded && (
                          <div className={styles.scoreDetail}>
                            {detail?.evidence && (
                              <p className={styles.scoreEvidence}>● {replaceQuestionRefs(detail.evidence)}</p>
                            )}
                            {detail?.weakness && (
                              <p className={styles.scoreWeakness}>△ {replaceQuestionRefs(detail.weakness)}</p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>음성 분석</h2>
              {voiceData ? (() => {
                const spmPct = Math.min(Math.round(voiceData.avgSpm / 5.5), 100);
                const ratioPct = Math.round((1 - voiceData.avgSilenceRatio) * 100);
                const spmColor = voiceSpmClass(voiceData.avgSpm) === styles.nonverbalValueGood ? "#16a34a"
                  : voiceSpmClass(voiceData.avgSpm) === styles.nonverbalValueNormal ? "#d97706" : "#dc2626";
                const ratioColor = voiceRatioClass(ratioPct) === styles.nonverbalValueGood ? "#16a34a"
                  : voiceRatioClass(ratioPct) === styles.nonverbalValueNormal ? "#d97706" : "#dc2626";
                return (
                  <>
                    <ul className={styles.scoreList}>
                      <li className={styles.scoreItem}>
                        <div className={styles.scoreRow}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "72px", flexShrink: 0 }}>
                            <span className={styles.scoreLabel}>발화 속도</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "#374151" }}>(SPM)</span>
                          </div>
                          <div style={{ flex: 1, position: "relative", height: "8px" }}>
                            <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, height: "14px", marginBottom: "3px" }}>
                              {([200, 250, 300, 350] as const).map((v) => (
                                <span key={v} style={{ position: "absolute", left: `${v / 5.5}%`, transform: "translateX(-50%)", fontSize: "0.6rem", color: "#b0b7c3" }}>{v}</span>
                              ))}
                            </div>
                            <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${spmPct}%`, background: spmColor, borderRadius: "4px", transition: "width 0.6s ease" }} />
                            </div>
                          </div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: spmColor, minWidth: "56px", textAlign: "right", flexShrink: 0 }}>{isNaN(voiceData.avgSpm) ? "-" : voiceData.avgSpm}</span>
                        </div>
                      </li>
                      <li className={styles.scoreItem} style={{ marginTop: "1.2rem" }}>
                        <div className={styles.scoreRow}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "72px", flexShrink: 0 }}>
                            <span className={styles.scoreLabel}>발화 비율</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "#374151" }}>(%)</span>
                          </div>
                          <div style={{ flex: 1, position: "relative", height: "8px" }}>
                            <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, height: "14px", marginBottom: "3px" }}>
                              {([50, 70] as const).map((v) => (
                                <span key={v} style={{ position: "absolute", left: `${v}%`, transform: "translateX(-50%)", fontSize: "0.6rem", color: "#b0b7c3" }}>{v}%</span>
                              ))}
                            </div>
                            <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${ratioPct}%`, background: ratioColor, borderRadius: "4px", transition: "width 0.6s ease" }} />
                            </div>
                          </div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: ratioColor, width: "60px", textAlign: "right", flexShrink: 0 }}>{ratioPct}%</span>
                        </div>
                      </li>
                    </ul>
                    <p className={styles.nonverbalFeedback} style={{ marginTop: "1rem" }}>{getVoiceFeedback(voiceData)}</p>
                  </>
                );
              })() : (
                <p className={styles.placeholderText}>분석 데이터가 없습니다.</p>
              )}
            </section>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>표정 분석</h2>
              {nonverbal ? (
                <div className={styles.nonverbalGrid}>
                  <div className={styles.nonverbalItem}>
                    <span className={styles.nonverbalLabel}>미소</span>
                    <span className={nonverbalValueClass(nonverbal.smileRate, 30, 15)}>{nonverbal.smileRate}%</span>
                  </div>
                  <div className={styles.nonverbalItem}>
                    <span className={styles.nonverbalLabel}>집중도</span>
                    <span className={nonverbalValueClass(nonverbal.alertnessScore, 80, 60)}>{nonverbal.alertnessScore}</span>
                  </div>
                  <div className={styles.nonverbalItem}>
                    <span className={styles.nonverbalLabel}>표정 점수</span>
                    <span className={nonverbalValueClass(nonverbal.expressionScore, 70, 50)}>{nonverbal.expressionScore} / 100</span>
                  </div>
                  <p className={styles.nonverbalSub}>분석 샘플: {nonverbal.sampleCount}회</p>
                  <p className={styles.nonverbalFeedback}>{getNonverbalFeedback(nonverbal)}</p>
                </div>
              ) : (
                <p className={styles.placeholderText}>분석 데이터가 없습니다.</p>
              )}
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
                  {q.isFollowUp ? `Q${q.parentOrder}-${q.followupIndex}` : `Q${q.order}`}
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
                {(currentQ.answerSummary || currentQ.answerText) && (
                  <div className={styles.feedbackBlock}>
                    <span className={`${styles.feedbackBadge} ${styles.badgeAnswer}`}>내 답변 요약</span>
                    <p className={`${styles.feedbackContent} ${styles.myAnswer}`}>
                      {currentQ.answerSummary || currentQ.answerText}
                    </p>
                  </div>
                )}
                {currentQ.feedback && (
                  <div className={styles.feedbackBlock}>
                    <span className={`${styles.feedbackBadge} ${styles.badgeFeedback}`}>답변 상세 피드백</span>
                    <p className={styles.feedbackContent}>{replaceQuestionRefs(currentQ.feedback)}</p>
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
