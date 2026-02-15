// src/components/Header.tsx
import { useState, useEffect } from "react"; // 1. 상태 관리 기능 추가
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import axios from "axios";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // 2. 닉네임을 저장할 상자(State) 만들기
  const [nickname, setNickname] = useState<string | null>(null);

  // 3. 화면이 켜질 때 백엔드에 로그인 여부 물어보기
  useEffect(() => {
  const checkLogin = async () => {
    try {
      // 백엔드에 만든 로그인 확인용 API 호출
      // withCredentials: true가 있어야 브라우저가 쿠키를 들고 서버로 이동함
      const response = await axios.get("http://localhost:8080/api/user/me", {
        withCredentials: true,
      });

      if (response.status === 200) {
        // 백엔드에서 유저 정보(닉네임 등)를 보내준다고 가정
        setNickname(response.data.nickname); 
      }
    } catch (error) {
      setNickname(null); // 로그인 안 되어 있음
    }
  };

  checkLogin();
}, [location]); // 페이지 이동할 때마다 체크

  // [추가] 로그인 체크 후 페이지 이동을 제어하는 핸들러
  const handleProtectedNavigation = (e: React.MouseEvent, path: string) => {
    if (!nickname) {
      e.preventDefault(); // 로그인이 안 되어 있으면 페이지 이동을 막음
      alert("로그인 후 이용 가능합니다.");
      navigate("/login"); // 로그인 창으로 redirect
    }
  };

  // 4. 로그아웃 버튼 눌렀을 때 실행할 함수
  const handleLogout = async () => {
    try {
    // 1. 우리 백엔드 서버에 로그아웃 요청 (쿠키 삭제용)
    await axios.post("http://localhost:8080/api/user/logout", {}, { withCredentials: true });

    // 2. 카카오 로그아웃 설정
    const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const LOGOUT_REDIRECT_URI = import.meta.env.VITE_KAKAO_LOGOUT_REDIRECT_URI;
    const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${REST_API_KEY}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`;

    // 3. 프론트 상태 및 로컬 저장소 비우기
    setNickname(null);
    localStorage.removeItem("nickname");

    // 4. 카카오 로그아웃 페이지로 이동
    window.location.href = kakaoLogoutUrl;
  } catch (error) {
    console.error("로그아웃 중 오류 발생:", error);
    alert("로그아웃에 실패했습니다.");
  }
  };

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
          
          {/* AI 면접관: 로그인 체크 로직 추가 */}
          <NavLink 
            to="/ai-select" 
            className={styles.link}
            onClick={(e) => handleProtectedNavigation(e, "/ai-select")}
          >
            AI 면접관
          </NavLink>

          {/* 마이페이지: 로그인 체크 로직 추가 */}
          <NavLink 
            to="/mypage" 
            className={styles.link}
            onClick={(e) => handleProtectedNavigation(e, "/mypage")}
          >
            마이페이지
          </NavLink>

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