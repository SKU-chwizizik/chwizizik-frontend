import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from "./Loading.module.css";

export default function Loading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const lang = searchParams.get("lang") ?? "ko";
  const type = searchParams.get("type") ?? "technical";
  const interviewId = searchParams.get("interviewId");

  useEffect(() => {
    const isExecutive = type.toLowerCase().includes("exec");
    const route = isExecutive ? "/interview/executive" : "/interview/technical";

    const init = async () => {
      try {
        const res = await axios.post(
          "/api/rag/start",
          { interviewId: Number(interviewId) },
          { withCredentials: true }
        );
        const { greeting, selectedPoolItemIds } = res.data;
        navigate(
          `${route}?lang=${lang}&type=${type}&interviewId=${interviewId}&greeting=${encodeURIComponent(greeting)}&poolIds=${encodeURIComponent(JSON.stringify(selectedPoolItemIds))}`
        );
      } catch (err) {
        console.error("면접 시작 실패:", err);
        navigate(`${route}?lang=${lang}&type=${type}&interviewId=${interviewId}`);
      }
    };

    const timer = setTimeout(init, 1500);
    return () => clearTimeout(timer);
  }, [navigate, lang, type, interviewId]);

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