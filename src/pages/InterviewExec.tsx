import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./InterviewTech.module.css";

export default function InterviewTech() {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang");

  const interviewerImg = "/img/InterviewerExec.png";

  // video 태그를 직접 연결하기 위한 ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 카메라 스트림 저장용
  const streamRef = useRef<MediaStream | null>(null);

  // 카메라 접근 실패 시 보여줄 메시지
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    const startCamera = async () => {
      try {
        // 사용자 웹캠 권한 요청
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        // 받아온 스트림을 video 태그에 연결
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

    // 컴포넌트가 사라질 때 카메라 종료
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [lang]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.category}>
          <h2 className={styles.title}>
            {lang === "ko" ? "임원 면접" : "Executive Interview"}
          </h2>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.interviewStage}>
          {/* 면접관 사진 영역 */}
          <div className={styles.interviewerSpace}>
            <img
              src={interviewerImg}
              alt="Executive Interviewer"
              className={styles.interviewerImage}
            />
          </div>

          {/* 사용자 카메라 영역 */}
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

          {/* 하단 질문 바 */}
          <footer className={styles.questionBar}>
            <p className={styles.questionText}>
              {lang === "ko"
                ? "우리 회사의 핵심 가치 중 본인과 가장 잘 맞는 것은 무엇인가요?"
                  : "Which of our company's core values resonates with you the most?"}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}