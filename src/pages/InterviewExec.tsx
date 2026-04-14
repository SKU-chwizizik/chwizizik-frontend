import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from "./InterviewExec.module.css";

export default function InterviewExec() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const lang        = searchParams.get("lang")        ?? "ko";
  const interviewId = searchParams.get("interviewId") ?? "";
  const greeting    = searchParams.get("greeting")
    ? decodeURIComponent(searchParams.get("greeting")!)
    : (lang === "ko" ? "안녕하세요, 면접을 시작하겠습니다." : "Hello, let's begin the interview.");
  const poolIds: number[] = (() => {
    try {
      const raw = searchParams.get("poolIds");
      return raw ? JSON.parse(decodeURIComponent(raw)) : [];
    } catch {
      return [];
    }
  })();

  const baseImg = "/img/InterviewerExec.png";
  const openImg = "/img/InterviewerExec_open.png";

  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef  = useRef<HTMLAudioElement | null>(null);

  const [cameraError, setCameraError]             = useState("");
  const [isSpeaking, setIsSpeaking]               = useState(false);
  const [showQuestion, setShowQuestion]           = useState(false);
  const [mouthOpen, setMouthOpen]                 = useState(false);

  // 면접 state machine
  const [phase, setPhase]                         = useState<"greeting" | "question" | "finished">("greeting");
  const [mainQuestionOrder, setMainQuestionOrder] = useState(0);
  const [isFollowUp, setIsFollowUp]               = useState(false);
  const [questionText, setQuestionText]           = useState(greeting);
  const [questionId, setQuestionId]               = useState<number | null>(null);
  const [answer, setAnswer]                       = useState("");
  const [isLoading, setIsLoading]                 = useState(false);
  const [showQuitModal, setShowQuitModal]         = useState(false);

  // 입 애니메이션
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isSpeaking) {
      intervalId = setInterval(() => setMouthOpen((prev) => !prev), 150);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(intervalId);
  }, [isSpeaking]);

  // 카메라
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraError(lang === "ko" ? "카메라에 접근할 수 없습니다." : "Cannot access camera.");
      }
    };
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioRef.current?.pause();
    };
  }, [lang]);

  // TTS (onDone: TTS 종료 후 콜백)
  const speakQuestion = async (text: string, onDone?: () => void) => {
    audioRef.current?.pause();
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: lang === "ko" ? "ko-KR-SunHiNeural" : "en-US-JennyNeural" }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        onDone?.();
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        onDone?.();
      };
      setIsSpeaking(true);
      await audio.play().catch(() => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        onDone?.();
      });
    } catch {
      onDone?.();
    }
  };

  // 다음 질문 요청
  const fetchNextQuestion = async (
    order: number,
    lastQId: number | null,
    lastAnswer: string,
  ) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        "/api/rag/next-question",
        {
          interviewId: Number(interviewId),
          lastQuestionId: lastQId,
          lastAnswer,
          mainQuestionOrder: order,
          selectedPoolItemIds: poolIds,
        },
        { withCredentials: true },
      );

      const { question, questionId: nextQId, isFollowUp: followUp, isFinished, questionOrder } = res.data;

      if (isFinished) {
        setPhase("finished");
        setQuestionText(question);
        speakQuestion(question);
      } else {
        setQuestionText(question);
        setQuestionId(nextQId ?? null);
        setIsFollowUp(!!followUp);
        if (!followUp) setMainQuestionOrder(questionOrder ?? order);
        setPhase("question");
        speakQuestion(question);
      }
    } catch (err) {
      console.error("질문 요청 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 마운트 시 greeting TTS → 완료 후 첫 질문 요청
  useEffect(() => {
    const timer = setTimeout(() => {
      speakQuestion(greeting, () => fetchNextQuestion(1, null, ""));
    }, 500);
    return () => {
      clearTimeout(timer);
      audioRef.current?.pause();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 답변 제출
  const handleSubmit = async () => {
    if (!answer.trim() || !interviewId || isLoading || isSpeaking) return;
    const submittedAnswer = answer;
    setAnswer("");
    await fetchNextQuestion(mainQuestionOrder + 1, questionId, submittedAnswer);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{lang === "ko" ? "임원 면접" : "Executive Interview"}</h2>
        {phase === "question" && !isFollowUp && mainQuestionOrder > 0 && (
          <span className={styles.progress}>{mainQuestionOrder} / 5</span>
        )}
        <button
          type="button"
          className={styles.quitButton}
          onClick={() => setShowQuitModal(true)}
        >
          {lang === "ko" ? "면접 포기" : "Quit Interview"}
        </button>
      </header>

      {showQuitModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalText}>
              {lang === "ko" ? "정말 면접을 포기하시겠습니까?" : "Are you sure you want to quit?"}
            </p>
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={async () => {
                  try {
                    await axios.delete(`/api/rag/interview/${interviewId}`, { withCredentials: true });
                  } catch { /* 삭제 실패해도 홈으로 이동 */ }
                  navigate("/");
                }}
              >
                {lang === "ko" ? "네" : "Yes"}
              </button>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowQuitModal(false)}
              >
                {lang === "ko" ? "아니요" : "No"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <section className={styles.interviewStage}>
          <div className={styles.interviewerSpace}>
            <img
              src={mouthOpen ? openImg : baseImg}
              alt="Executive Interviewer"
              className={`${styles.interviewerImage} ${!isSpeaking ? styles.interviewerClickable : ""}`}
              onClick={() => { if (!isSpeaking) speakQuestion(questionText); }}
            />
          </div>

          <div className={styles.userCamera}>
            {cameraError ? (
              <p className={styles.cameraText}>{cameraError}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className={styles.userVideo} />
            )}
          </div>

          <div className={styles.questionControls}>
            <div className={styles.questionToggleWrap}>
              <div className={styles.switchBox}>
                <span className={styles.switchLabel}>{lang === "ko" ? "질문 보기" : "Show Question"}</span>
                <button
                  type="button"
                  className={`${styles.switch} ${showQuestion ? styles.switchOn : styles.switchOff}`}
                  onClick={() => setShowQuestion((prev) => !prev)}
                >
                  <span className={styles.switchThumb} />
                </button>
              </div>
            </div>
          </div>

          <footer className={`${styles.questionBar} ${!showQuestion ? styles.questionBarHidden : ""}`}>
            <div className={styles.questionTextWrap}>
              <p className={styles.questionText}>{questionText}</p>
            </div>
          </footer>
        </section>

        {phase === "finished" ? (
          <section className={styles.finishSection}>
            <p className={styles.finishText}>
              {lang === "ko" ? "면접이 종료되었습니다. 수고하셨습니다!" : "Interview finished. Great job!"}
            </p>
            <button
              type="button"
              className={styles.submitButton}
              onClick={() => navigate(`/result?interviewId=${interviewId}`)}
            >
              {lang === "ko" ? "결과 보기" : "View Results"}
            </button>
          </section>
        ) : (
          <section className={styles.answerSection}>
            <textarea
              className={styles.answerInput}
              placeholder={
                isSpeaking || phase === "greeting"
                  ? (lang === "ko" ? "면접관이 말하는 중입니다..." : "Interviewer is speaking...")
                  : (lang === "ko" ? "답변을 입력하세요..." : "Type your answer...")
              }
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              disabled={isSpeaking || isLoading || phase === "greeting"}
            />
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!answer.trim() || isSpeaking || isLoading || phase === "greeting"}
            >
              {isLoading
                ? (lang === "ko" ? "답변 처리 중..." : "Processing...")
                : (lang === "ko" ? "답변 제출" : "Submit Answer")}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
