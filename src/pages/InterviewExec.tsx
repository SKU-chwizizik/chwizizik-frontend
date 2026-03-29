import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./InterviewExec.module.css";

export default function InterviewExec() {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang") ?? "ko";

  const interviewerImg = "/img/InterviewerExec.png";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);

  const questionText = useMemo(() => {
    return lang === "ko"
      ? "우리 회사의 핵심 가치 중 본인과 가장 잘 맞는 것은 무엇인가요?"
      : "Which of our company's core values resonates with you the most?";
  }, [lang]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("카메라 접근 실패:", error);
        setCameraError(
          lang === "ko"
            ? "카메라에 접근할 수 없습니다."
            : "Cannot access camera."
        );
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, [lang]);

  const speakQuestion = () => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.lang = lang === "ko" ? "ko-KR" : "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      speakQuestion();
    }, 500);

    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [questionText]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {lang === "ko" ? "임원 면접" : "Executive Interview"}
        </h2>
      </header>

      <main className={styles.main}>
        <section className={styles.interviewStage}>
          <div className={styles.interviewerSpace}>
            <img
              src={interviewerImg}
              alt="Executive Interviewer"
              className={styles.interviewerImage}
            />
          </div>

          <div className={styles.userCamera}>
            {cameraError ? (
              <p className={styles.cameraText}>{cameraError}</p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.userVideo}
              />
            )}
          </div>

          <div className={styles.questionToggleWrap}>
            <div className={styles.switchBox}>
              <span className={styles.switchLabel}>
                {lang === "ko" ? "질문 보기" : "Show Question"}
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={showQuestion}
                className={`${styles.switch} ${
                  showQuestion ? styles.switchOn : styles.switchOff
                }`}
                onClick={() => setShowQuestion((prev) => !prev)}
              >
                <span className={styles.switchThumb} />
              </button>
            </div>
          </div>

          <div className={styles.speakerButtonWrap}>
            <button
              type="button"
              className={`${styles.speakerButton} ${
                isSpeaking ? styles.speakerButtonActive : ""
              }`}
              onClick={speakQuestion}
              aria-label={lang === "ko" ? "질문 다시 듣기" : "Replay question"}
              title={lang === "ko" ? "질문 다시 듣기" : "Replay question"}
            >
              🔊
            </button>
          </div>

          {showQuestion && (
            <footer className={styles.questionBar}>
              <p className={styles.questionText}>{questionText}</p>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}