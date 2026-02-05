import { Link } from "react-router-dom";
import styles from "./Login.module.css";

const KAKAO_ICON_SRC = "/img/kakao_icon.png";
const NAVER_ICON_SRC = "/img/naver_icon.png";

export default function Login() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 로그인 로직 연결
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>로그인</h1>

        <form className={styles.form} onSubmit={onSubmit}>
          <input className={styles.input} placeholder="아이디" />
          <input className={styles.input} placeholder="비밀번호" type="password" />

          <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">
            로그인
          </button>
        </form>

        {/* ✅ form 밖이어도 폭 똑같이 맞추는 래퍼 */}
        <div className={styles.form}>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/Signup">
            회원가입
          </Link>
        </div>

        <div className={styles.snsBlock}>
          <div className={styles.snsDivider}>
            <span>SNS 간편 로그인</span>
          </div>

          <div className={styles.snsButtons}>
            <button type="button" className={`${styles.snsBtn} ${styles.kakao}`}>
              <span className={styles.snsIconBox}>
                <img className={styles.snsIcon} src={KAKAO_ICON_SRC} alt="kakao" />
              </span>
              <span className={styles.snsText}>카카오 로그인</span>
            </button>

            <button type="button" className={`${styles.snsBtn} ${styles.naver}`}>
              <span className={styles.snsIconBox}>
                <img className={styles.snsIcon} src={NAVER_ICON_SRC} alt="naver" />
              </span>
              <span className={styles.snsText}>네이버 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
