import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoAuth = () => {
    const navigate = useNavigate();

    // 1. URL의 인가코드 가져오기
    const code = new URL(window.location.href).searchParams.get("code");
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // 2. 요청 중복 방지용 자물쇠
    const isSent = useRef(false);
    useEffect(() => {
        const kakaoLogin = async () => {
            // 코드가 없거나 이미 보냈으면 스톱!
            if (!code || isSent.current) return;

            // 자물쇠 잠금 (중복 요청 방지)
            isSent.current = true;

            try {
                console.log("인가코드 발견! 백엔드로 보냅니다:", code);

                // 3. 백엔드로 코드 전송 (주소: /kakao/auth-code)
                const res = await axios.get(`${BACKEND_URL}/kakao/auth-code?code=${code}`);

                console.log("로그인 성공! 받은 데이터:", res.data);

                // 4. ⭐ [핵심] 받아온 유저 정보를 브라우저에 저장하기
                // (백엔드 응답 형태에 따라 안전하게 저장)
                if (res.data.nickname) {
                    localStorage.setItem("nickname", res.data.nickname);
                } else if (res.data.properties && res.data.properties.nickname) {
                    localStorage.setItem("nickname", res.data.properties.nickname);
                } else {
                    // 이름이 없으면 기본값 저장
                    localStorage.setItem("nickname", "사용자");
                }

                // (선택) 액세스 토큰이 있다면 저장 (나중에 필요할 수 있음)
                if (res.data.accessToken) {
                    localStorage.setItem("accessToken", res.data.accessToken);
                }


                navigate("/welcome", { state: { userInfo: res.data.user } });

            } catch (error) {
                console.error("로그인 에러:", error);
                alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
                navigate("/login");
            }
        };

        kakaoLogin();
    }, [code, navigate, BACKEND_URL]);

    return <div>로그인 처리 중...</div>;
};

export default KakaoAuth;