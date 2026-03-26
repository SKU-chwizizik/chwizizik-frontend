import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Loading.module.css";

export default function Loading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 파라미터 가져오기
  const lang = searchParams.get("lang") ?? "ko";
  const type = searchParams.get("type");

  useEffect(() => {
    console.log("Loading 페이지에 전달된 type:", type);

    const timer = setTimeout(() => {
      // 1. 임원 면접인 경우 
      if (type?.toLowerCase().includes("exec")) {
        navigate(`/interview/executive?lang=${lang}`);
      } 
      // 2. 기술 면접인 경우 
      else if (type?.toLowerCase().includes("tech")) {
        navigate(`/interview/technical?lang=${lang}`);
      } 

      else {
        console.warn("타입이 명확하지 않아 기술 면접으로 자동 연결합니다.");
        navigate(`/interview/technical?lang=${lang}`);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, lang, type]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.spinner}>
          <div className={styles.doubleBounce1}></div>
          <div className={styles.doubleBounce2}></div>
        </div>
        <div className={styles.textSection}>
          <h1 className={styles.title}>
            {lang === "ko" ? "면접 환경을 준비 중입니다..." : "Preparing interview environment..."}
          </h1>
          <p className={styles.hint}>
            {lang === "ko" 
              ? "잠시만 기다려주세요. AI 면접관이 곧 연결됩니다." 
              : "Please wait a moment. AI interviewer will be connected soon."}
          </p>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      </div>
    </div>
  );
}