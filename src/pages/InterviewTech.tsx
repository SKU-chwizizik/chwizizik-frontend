import React from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./InterviewTech.module.css"; 

export default function InterviewTech() {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang");

  const interviewerImg = "/img/InterviewerTech.png"; 

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.category}>
          <h2 className={styles.title}>
            {lang === "ko" ? "기술 면접" : "Technical Interview"}
          </h2>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.interviewStage}>
          {/* 면접관 사진 영역 */}
          <div className={styles.interviewerSpace}>
            <img 
              src={interviewerImg} 
              alt="Technical Interviewer" 
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
                ? "가장 자신 있는 프로그래밍 언어의 장단점과, 그 언어를 사용해 해결했던 기술적 도전 경험을 설명해 주세요."
                : "Describe the pros and cons of your most confident programming language and a technical challenge you solved using it."}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}