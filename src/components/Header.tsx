// src/components/Header.tsx
import { useState, useEffect } from "react"; // 1. 상태 관리 기능 추가
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  const navigate = useNavigate();
  
  // 3. 화면이 켜질 때 딱 한 번 실행: "브라우저에 저장된 이름 있나?" 확인
  useEffect(() => {
    
    const storedName = localStorage.getItem("nickname");
    if (storedName) {
      setNickname(storedName); // 있으면 상자에 담기
    }
  }, []);

  // 4. 로그아웃 버튼 눌렀을 때 실행할 함수
  const handleLogout = () => {
    const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const LOGOUT_REDIRECT_URI = import.meta.env.VITE_KAKAO_LOGOUT_REDIRECT_URI; // 로그아웃 후 돌아올 주소
    const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${REST_API_KEY}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`;
    localStorage.removeItem("nickname"); // 저장소에서 이름 삭제
    // localStorage.removeItem("accessToken"); // (나중에 토큰도 지워야 함)
    setNickname(null); // 화면에서도 이름 지우기
    // 카카오 로그아웃 페이지로 이동
    window.location.href = kakaoLogoutUrl;
  };

  // 2. 닉네임을 저장할 상자(State) 만들기 (처음엔 비어있음)
  const [nickname, setNickname] = useState<string | null>(null);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* 왼쪽: 로고 */}
        <div className={styles.logo} onClick={() => navigate("/")}>
          <img src="/img/logo.png" alt="logo" />
          <span>취지직</span>
        </div>

        {/* 오른쪽: 메뉴 + 로그인 / 로그아웃 */}
        <nav className={styles.right}>
          <NavLink to="/" className={styles.link}>HOME</NavLink>
          <NavLink to="/ai" className={styles.link}>AI 면접관</NavLink>
          <NavLink to="/mypage" className={styles.link}>마이페이지</NavLink>
          {nickname ? (
            // [로그인 상태일 때] : 닉네임 + 로그아웃 버튼 표시
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className={styles.link} style={{ cursor: "default", fontWeight: "bold" }}>
                {nickname}님
              </span>
              <button className={styles.loginBtn} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            // [로그아웃 상태일 때] : 기존 로그인 버튼 표시
            <button className={styles.loginBtn} onClick={() => navigate("/login")}>
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
