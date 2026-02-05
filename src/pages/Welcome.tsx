import { useNavigate } from "react-router-dom";
import styles from "./Welcome.module.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>환영합니다!</h1>
        <p className={styles.desc}>
          회원가입이 완료되었습니다. <br />
          포트폴리오를 등록하고 면접 준비를 시작해보세요.
        </p>

        <div className={styles.btnRow}>
          <button className={`${styles.btn} ${styles.primary}`} onClick={() => navigate("/portfolio")}>
            포트폴리오 등록
          </button>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={() => navigate("/")}>
            나중에 하기
          </button>
        </div>
      </div>
    </main>
  );
}
