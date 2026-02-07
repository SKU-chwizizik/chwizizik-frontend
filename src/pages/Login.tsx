import React from "react";
import { Link} from "react-router-dom";
import styles from "./Login.module.css";

// 이미지 경로는 프로젝트에 맞게 확인하면 댐
const KAKAO_ICON_SRC = "/img/kakao_icon.png";
const NAVER_ICON_SRC = "/img/naver_icon.png";

export default function Login() {
  // .env 파일에서 값 가져오기
  const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  
  // 카카오 로그인 URL 만들기
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${restApiKey}&redirect_uri=${redirectUri}&response_type=code`;

  const handleKakaoLogin = () => {
    // 카카오로 이동
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>로그인</h1>
        
        {/* 기존 로그인 폼 (생략 가능) */}
        <form className={styles.form}>
           {/* ...아이디/비번 입력창들... */}
        </form>

        <div className={styles.snsBlock}>
          <div className={styles.snsButtons}>
            {/* 카카오 버튼 */}
            <button 
              type="button" 
              className={`${styles.snsBtn} ${styles.kakao}`}
              onClick={handleKakaoLogin}
            >
              <span className={styles.snsIconBox}>
                <img className={styles.snsIcon} src={KAKAO_ICON_SRC} alt="kakao" />
              </span>
              <span className={styles.snsText}>카카오 로그인</span>
            </button>
            {/* 네이버 버튼... */}
          </div>
        </div>
      </div>
    </main>
  );
}