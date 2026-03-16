import { BsArrowDownCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  // "아래로 가기" 버튼 클릭 시 두 번째 섹션으로 부드럽게 스크롤
  const scrollToSecond = () => {
    document.getElementById("secondSection")?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ AI 면접 시작 버튼 클릭 시 실행되는 로직
  const handleStartClick = () => {
    // 1. 현재 브라우저에 저장되어 있다고 확인된 'profileImage' 값을 가져옵니다.
    const profileImg = localStorage.getItem("profileImage");
    
    // 추가로 nickname도 저장될 수 있으니 함께 체크하면 더 정확합니다.
    const nickname = localStorage.getItem("nickname");

    // 2. profileImg 혹은 nickname이 존재하면 로그인 상태로 간주
    if (profileImg || nickname) {
      console.log("로그인 정보 확인됨: AI 선택 페이지로 이동합니다.");
      navigate("/ai-select");
    } else {
      // 3. 정보가 없다면 비로그인 상태이므로 로그인 페이지로 이동
      console.log("로그인 정보 없음: 로그인 페이지로 이동합니다.");
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    }
  };

  return (
    <>
      {/* 첫 번째 히어로 섹션 */}
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

        {/* 하단 스크롤 유도 버튼 */}
        <button className={styles.downBtn} onClick={scrollToSecond} type="button" aria-label="scroll down">
          <BsArrowDownCircle size={34} />
        </button>
      </section>

      {/* 두 번째 섹션 */}
      <section id="secondSection" className={styles.second}>
        <img className={styles.secondBg} src="/img/HomeBackground.png" alt="Background" />
        <div className={styles.secondOverlay}>
          <div className={`container ${styles.secondContent}`}>
            <p className={styles.smallTitle}>데이터 기반 분석과 맞춤형 피드백</p>
            <h2 className={styles.bigTitle}>AI로 완성하는 실전 면접</h2>
            <div className={styles.line} />

            {/* ✅ 클릭 핸들러 연결 */}
            <button className={styles.startBtn} onClick={handleStartClick} type="button">
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