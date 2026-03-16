import React from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./InterviewTech.module.css"; 

export default function InterviewExec() {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang");

  // public/img 폴더 안에 있으므로 경로에 /img/를 추가합니다.
  const interviewerImg = "/img/InterviewerExec.png"; 

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
            <p>User Camera</p>
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