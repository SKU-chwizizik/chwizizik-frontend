import { BsArrowDownCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  const scrollToSecond = () => {
    document.getElementById("secondSection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroLeft}>
            <h1 className={styles.h1}>
              <span>맞춤형 AI 면접관</span>
              <span>알맞게 대비하세요</span>
            </h1>
            <p className={styles.sub}>당신의 합격을 지원합니다.</p>
          </div>

          <div className={styles.heroRight}>
            <img className={styles.people} src="/img/HomePeople.png" alt="HomePeople" />
          </div>
        </div>

        <button className={styles.downBtn} onClick={scrollToSecond} type="button" aria-label="scroll down">
          <BsArrowDownCircle size={34} />
        </button>
      </section>

      <section id="secondSection" className={styles.second}>
        <img className={styles.secondBg} src="/img/HomeBackground.png" alt="Background" />
        <div className={styles.secondOverlay}>
          <div className={`container ${styles.secondContent}`}>
            <p className={styles.smallTitle}>데이터 기반 분석과 맞춤형 피드백</p>
            <h2 className={styles.bigTitle}>AI로 완성하는 실전 면접</h2>
            <div className={styles.line} />

            <button className={styles.startBtn} onClick={() => navigate("/ai")} type="button">
              AI 면접 시작
            </button>

            <div className={styles.desc}>
              <p>데이터 기반 분석으로 지원자의 강점을 발견하고 성장 방향을 제시합니다.</p>
              <p>사용자가 스스로 성장하며 합격할 때까지 도전할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
