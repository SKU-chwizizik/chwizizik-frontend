// src/components/Header.tsx
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* 왼쪽: 로고 */}
        <div className={styles.logo} onClick={() => navigate("/")}>
          <img src="/img/logo.png" alt="logo" />
          <span>취지직</span>
        </div>

        {/* 오른쪽: 메뉴 + 로그인 */}
        <nav className={styles.right}>
          <NavLink to="/" className={styles.link}>HOME</NavLink>
          <NavLink to="/ai" className={styles.link}>AI 면접관</NavLink>
          <NavLink to="/mypage" className={styles.link}>마이페이지</NavLink>
          <button className={styles.loginBtn} onClick={() => navigate("/login")}>
            로그인
          </button>
        </nav>
      </div>
    </header>
  );
}
