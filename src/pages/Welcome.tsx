import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Welcome.module.css";

export default function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();
  // KakaoAuth에서 넘겨준 데이터 받기
  const userInfo = location.state?.userInfo;

  useEffect(() => {
    if (userInfo?.nickname) {
      localStorage.setItem("nickname", userInfo.nickname);
      // 추후 Spring Boot 연동 시 백엔드에서 받은 토큰도 여기서 저장
    }
  }, [userInfo]);

  const handleGoMain = () => {
    window.location.href = "/";
  };

  const handleGoPortfolio = () => {
    navigate("/portfolio");
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>환영합니다! {userInfo?.nickname || "사용자"}님!</h1>
        <p className={styles.desc}>
          회원가입이 완료되었습니다. <br />
          포트폴리오를 등록하고 면접 준비를 시작해보세요.
        </p>

        <div className={styles.btnRow}>
          <button className={`${styles.btn} ${styles.primary}`} onClick={handleGoPortfolio}>
            포트폴리오 등록
          </button>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={handleGoMain}>
            나중에 하기
          </button>
        </div>
      </div>
    </main>
  );
}
