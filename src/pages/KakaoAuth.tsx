import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoAuth = () => {
  const navigate = useNavigate();
  const isSent = useRef(false);

  // 1. URL에서 인가코드(?code=...) 추출
  const code = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    const kakaoLogin = async () => {
      // 코드가 없거나 이미 요청을 보냈다면 중단
      if (!code || isSent.current) return;

      // 요청 중복 방지 (자물쇠 잠금)
      isSent.current = true;

      try {
        console.log("인가코드 발견! 백엔드로 전송합니다:", code);

        // 2. 백엔드로 코드 전송 (포트 8080 확인)
        // VITE_BACKEND_URL이 설정 안 되어 있을 경우를 대비해 직접 주소를 넣었습니다.
        const res = await axios.get(`http://localhost:8080/kakao/auth-code?code=${code}`);

        console.log("로그인 성공! 받은 데이터:", res.data);

        // 3. 데이터 안전하게 추출 (카카오 전용 구조)
        // res.data.kakao_account.profile.nickname 경로가 맞는지 확인하며 가져옵니다.
        const kakaoAccount = res.data.kakao_account;
        const nickname = kakaoAccount?.profile?.nickname || "사용자";
        const profileImage = kakaoAccount?.profile?.profile_image_url || "";

        // 4. 브라우저 저장소(localStorage)에 저장
        localStorage.setItem("nickname", nickname);
        localStorage.setItem("profileImage", profileImage);

        // 5. 환영 페이지로 이동
        // 백엔드 응답 전체 데이터를 state에 담아서 넘겨줍니다.
        navigate("/welcome", { state: { userInfo: res.data } });

      } catch (error: any) {
        console.error("로그인 에러 발생:", error);
        
        // 에러 상세 내용 출력 (디버깅용)
        if (error.response) {
          console.error("에러 데이터:", error.response.data);
        }

        alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/login");
      }
    };

    kakaoLogin();
  }, [code, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>카카오 로그인 처리 중...</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
};

export default KakaoAuth;