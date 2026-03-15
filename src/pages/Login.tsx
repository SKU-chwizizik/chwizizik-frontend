import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { loginUser } from "../api/auth";

// SNS 로그인 아이콘 이미지 경로
const KAKAO_ICON_SRC = "/img/kakao_icon.png";
const NAVER_ICON_SRC = "/img/naver_icon.png";

export default function Login() {

  // 페이지 이동을 위한 hook
  const navigate = useNavigate();

  // ====== 로그인 입력값 State ======
  // 아이디 입력값 저장
  const [userId, setUserId] = useState("");
  // 비밀번호 입력값 저장
  const [password, setPassword] = useState("");

  // ====== 로그인 버튼 활성화 조건 ======
  // 아이디와 비밀번호가 모두 입력되었을 때만 로그인 버튼 활성화
  const isValid = userId.trim() !== "" && password.trim() !== "";

  // ====== 로그인 제출 함수 ======
  // form 제출 시 실행되는 함수
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    // 기본 form 새로고침 방지
    e.preventDefault();

    // 1️. 입력값 검증
    if (!userId.trim() || !password.trim()) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {

      // 2️. 로그인 API 호출
      // auth.ts에 정의된 loginUser 함수 사용
      const data = await loginUser({
        userId,
        password
      });

      // 로그인 응답 확인
      console.log("로그인 응답:", data);

      // 로그인 성공 안내
      alert("로그인 성공!");

      // 3️. 로그인 성공 후 메인 페이지 이동
      navigate("/");

    } catch (error: any) {

      // 4️. 로그인 실패 처리
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "로그인에 실패했습니다.";

      alert(errorMsg);

      console.error("Login Error:", error);
    }
  };



  // ====== 카카오 로그인 ======
  // .env 파일에서 카카오 API 정보 가져오기
  const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  // 카카오 인증 요청 URL 생성
  const KAKAO_AUTH_URL =
    `https://kauth.kakao.com/oauth/authorize?client_id=${restApiKey}&redirect_uri=${redirectUri}&response_type=code`;

  // 카카오 로그인 버튼 클릭 시 카카오 인증 페이지로 이동
  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>

        {/* 페이지 제목 */}
        <h1 className={styles.title}>로그인</h1>

        {/* ====== 로그인 Form ====== */}
        {/* onSubmit을 통해 로그인 함수 실행 */}
        <form className={styles.form} onSubmit={onSubmit}>

          {/* 아이디 입력 */}
          <input
            className={styles.input}
            placeholder="아이디"

            // 입력값을 state와 연결
            value={userId}

            // 입력 시 state 업데이트
            onChange={(e) => setUserId(e.target.value)}
          />

          {/* 비밀번호 입력 */}
          <input
            className={styles.input}
            placeholder="비밀번호"
            type="password"

            // state 연결
            value={password}

            // 입력 시 state 업데이트
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 로그인 버튼 */}
          <button
            className={`${styles.btn} ${styles.btnPrimary} ${
              !isValid ? styles.btnDisabled : ""
            }`}

            // form 제출 버튼
            type="submit"

            // 입력이 없으면 버튼 비활성화
            disabled={!isValid}
          >
            로그인
          </button>


          {/* 회원가입 페이지 이동 */}
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/Signup">
            회원가입
          </Link>

        </form>

        {/* ====== SNS 로그인 영역 ====== */}
        <div className={styles.snsBlock}>

          {/* 구분선 */}
          <div className={styles.snsDivider}>
            <span>SNS 간편 로그인</span>
          </div>


          {/* SNS 로그인 버튼 영역 */}
          <div className={styles.snsButtons}>

            {/* 카카오 로그인 버튼 */}
            <button
              type="button"
              className={`${styles.snsBtn} ${styles.kakao}`}
              onClick={handleKakaoLogin}
            >

              <span className={styles.snsIconBox}>
                <img
                  className={styles.snsIcon}
                  src={KAKAO_ICON_SRC}
                  alt="kakao"
                />
              </span>

              <span className={styles.snsText}>
                카카오 로그인
              </span>

            </button>



            {/* 네이버 로그인 버튼 */}
            <button
              type="button"
              className={`${styles.snsBtn} ${styles.naver}`}
            >

              <span className={styles.snsIconBox}>
                <img
                  className={styles.snsIcon}
                  src={NAVER_ICON_SRC}
                  alt="naver"
                />
              </span>

              <span className={styles.snsText}>
                네이버 로그인
              </span>

            </button>

          </div>
        </div>

      </div>
    </main>
  );
}