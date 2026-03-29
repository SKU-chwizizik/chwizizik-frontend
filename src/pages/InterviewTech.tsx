import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./InterviewTech.module.css";

export default function InterviewTech() {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang") ?? "ko";

  // 1. 이미지 경로 설정 
  const imgClosed = "/img/InterviewerTech.png"; 
  const imgOpen = "/img/InterviewerTech_open.png"; 

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  
  // 2. 현재 보여줄 이미지 상태 추가
  const [currentImg, setCurrentImg] = useState(imgClosed);

  const questionText = useMemo(() => {
    return lang === "ko"
      ? "가장 자신 있는 프로그래밍 언어의 장단점과, 그 언어로 해결했던 기술적 문제를 설명해주세요."
      : "Describe the pros and cons of your strongest programming language and a technical problem you solved using it.";
  }, [lang]);

  // 3. 말할 때 이미지를 0.1초 간격으로 교체하는 로직
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;;

    if (isSpeaking) {
      // 0.1초마다 이미지 번갈아 가며 바꾸기
      intervalId = setInterval(() => {
        setCurrentImg((prev) => (prev === imgClosed ? imgOpen : imgClosed));
      }, 150);
    } else {
      // 말하기가 끝나면 다시 입 다문 이미지로 고정
      setCurrentImg(imgClosed);
    }

    return () => clearInterval(intervalId);
  }, [isSpeaking]);

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
        setCameraError(lang === "ko" ? "카메라에 접근할 수 없습니다." : "Cannot access camera.");
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
    
    // 이벤트 연결
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
        <h2 className={styles.title}>{lang === "ko" ? "기술 면접" : "Technical Interview"}</h2>
      </header>

      <main className={styles.main}>
        <section className={styles.interviewStage}>
          <div className={styles.interviewerSpace}>
            {/* 4. src를 currentImg 상태값으로 변경 */}
            <img
              src={currentImg} 
              alt="Technical Interviewer"
              className={styles.interviewerImage}
            />
          </div>

          <div className={styles.userCamera}>
            {cameraError ? (
              <p className={styles.cameraText}>{cameraError}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className={styles.userVideo} />
            )}
          </div>

          <div className={styles.questionToggleWrap}>
            <div className={styles.switchBox}>
              <span className={styles.switchLabel}>{lang === "ko" ? "질문 보기" : "Show Question"}</span>
              <button
                type="button"
                role="switch"
                aria-checked={showQuestion}
                className={`${styles.switch} ${showQuestion ? styles.switchOn : styles.switchOff}`}
                onClick={() => setShowQuestion((prev) => !prev)}
              >
                <span className={styles.switchThumb} />
              </button>
            </div>
          </div>

          <div className={styles.speakerButtonWrap}>
            <button
              type="button"
              className={`${styles.speakerButton} ${isSpeaking ? styles.speakerButtonActive : ""}`}
              onClick={speakQuestion}
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