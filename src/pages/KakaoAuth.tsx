import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoAuth = () => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      axios.get(`${BACKEND_URL}/kakao/auth-code?code=${code}`)
        .then((res) => {
          console.log("로그인 성공!", res.data);
          
          // 1. 토큰 저장
          if (res.data.accessToken) {
            localStorage.setItem("token", res.data.accessToken);
          }

          // 2. welcome 페이지로 이동 (state를 통해 유저 데이터 전달 가능)
          navigate("/welcome", { state: { userInfo: res.data.user } });
        })
        .catch((err) => {
          console.error("로그인 실패:", err);
          navigate("/login");
        });
    }
  }, [navigate, BACKEND_URL]);

  return <div>로그인 처리 중...</div>;
};

export default KakaoAuth;