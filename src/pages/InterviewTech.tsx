import React from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./InterviewTech.module.css"; 

export default function InterviewExec() {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.category}>
          <h2 className={styles.title}>
            {lang === "ko" ? "기술 면접" : "Executive Interview"}
          </h2>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.interviewStage}>
          <div className={styles.interviewerSpace}>
            <p>{lang === "ko" ? "임원 면접관 사진 영역" : "Executive Interviewer Area"}</p>
          </div>

          <div className={styles.userCamera}>
            <p>User Camera</p>
          </div>

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